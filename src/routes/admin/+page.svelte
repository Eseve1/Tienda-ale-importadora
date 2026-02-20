<script lang="ts">
	// @ts-nocheck
	import { onMount, tick } from 'svelte';
	import { Client, Databases, Storage, ID, Query, Account } from 'appwrite';

	// --- CONFIGURACIÓN ---
	const ENDPOINT = "https://api.importadoraale.app/v1";
	const PROJECT_ID = "6978d1bc000bad7c5671";
	const DATABASE_ID = "6978d1f3000ea0b56ebc";
	const COLLECTION_ID = "catalogo_ale";
	const BUCKET_ID = "6978d7a5001a8a5c7c9e";
	const PAGE_SIZE = 1000;

	// --- VARIABLES ---
	let client, db, storage, account;
	let isLoggedIn = false;
	let loading = false;
	let viewMode = 'upload'; // 'upload' | 'search'
	let nameInputRef; // Para el auto-focus

	let email = "ed.severiche@gmail.com";
	let passwordInput = "";
	let loginError = false;

	let inventory = [];
	let searchTerm = "";
	let filterCat = "";

	let msg = { text: "", type: "" };
	let isDragging = false; // Nuevo estado visual para drag & drop

	// Formulario (2 FOTOS - OPTIMIZADO)
	let form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
	let file1, file2, preview1, preview2;

	const categorias = ["Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	// --- INICIO ---
	onMount(async () => {
		client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
		db = new Databases(client);
		storage = new Storage(client);
		account = new Account(client);

		try {
			await account.get();
			isLoggedIn = true;
			cargarInventario();
		} catch (e) { isLoggedIn = false; }
	});

	// --- LOGICA ---
	async function login() {
		loading = true;
		try {
			await account.createEmailPasswordSession(email, passwordInput);
			isLoggedIn = true;
			cargarInventario();
		} catch (e) { loginError = true; setTimeout(()=>loginError=false, 2000); }
		loading = false;
	}

	async function logout() {
		await account.deleteSession('current');
		isLoggedIn = false;
	}

	async function cargarInventario() {
		try {
			const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(PAGE_SIZE), Query.orderDesc('$createdAt')]);
			inventory = res.documents;
		} catch (e) { console.error(e); }
	}

	async function guardarProducto() {
		if (!form.descripcion) return showMsg("Falta descripción", "error");
		loading = true;
		try {
			let url1 = form.imagen;
			let url2 = form.imagen2;

			if (file1) url1 = await uploadPhoto(file1);
			if (file2) url2 = await uploadPhoto(file2);

			const data = {
				descripcion: form.descripcion,
				codigo: form.codigo,
				categoria: form.categoria,
				preciopormayor: parseFloat(form.preciopormayor),
				precioUnidad: parseFloat(form.precioUnidad),
				moq: parseInt(form.moq),
				imagen: url1,
				imagen2: url2,
				disponible: form.disponible
			};

			if (form.id) {
				await db.updateDocument(DATABASE_ID, COLLECTION_ID, form.id, data);
				const idx = inventory.findIndex(p => p.$id === form.id);
				if(idx > -1) inventory[idx] = { ...inventory[idx], ...data };
				showMsg("Producto Actualizado", "success");
				viewMode = 'search';
				resetForm();
			} else {
				const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
				inventory = [newDoc, ...inventory];
				showMsg("Creado: " + form.descripcion, "success");

				// MODO RÁFAGA
				const currentCat = form.categoria;
				resetForm();
				form.categoria = currentCat;

				await tick();
				if(nameInputRef) nameInputRef.focus();
			}
		} catch (e) {
			console.error(e);
			showMsg("Error al guardar", "error");
		}
		loading = false;
	}

	async function toggleStock(item) {
		const nuevoEstado = !item.disponible;
		item.disponible = nuevoEstado;
		inventory = [...inventory];
		try {
			await db.updateDocument(DATABASE_ID, COLLECTION_ID, item.$id, { disponible: nuevoEstado });
		} catch (e) {
			item.disponible = !nuevoEstado;
			inventory = [...inventory];
		}
	}

	async function uploadPhoto(file) {
		const up = await storage.createFile(BUCKET_ID, ID.unique(), file);
		return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${up.$id}/preview?project=${PROJECT_ID}&width=800&quality=80&output=webp`;
	}

	function venderPorWsp(item) {
		const texto = `Hola! Me interesa:\n\n📦 *${item.descripcion}*\n💰 Precio: *Bs ${item.preciopormayor}*\n\nVer foto: ${item.imagen}`;
		window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
	}

	function editar(item) {
		form = { ...item, id: item.$id };
		preview1 = item.imagen;
		preview2 = item.imagen2;
		viewMode = 'upload';
	}

	function resetForm() {
		form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
		file1 = null; file2 = null;
		preview1 = ""; preview2 = "";
	}

	function showMsg(text, type) {
		msg = { text, type };
		setTimeout(() => msg = { text: "", type: "" }, 2000);
	}

	// --- NUEVA LÓGICA DE DRAG & DROP ---
	function handleFileSelect(file, num) {
		if (file) {
			const url = URL.createObjectURL(file);
			if (num === 1) { file1 = file; preview1 = url; }
			else if (num === 2) { file2 = file; preview2 = url; }
		}
	}

	function handleDrop(e, num) {
		e.preventDefault();
		isDragging = false;
		const dt = e.dataTransfer;
		if (dt.files && dt.files[0]) {
			handleFileSelect(dt.files[0], num);
		}
	}

	function handleDragOver(e) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e) {
		isDragging = false;
	}

	$: listaFiltrada = (!searchTerm && !filterCat) ? inventory : inventory.filter(p => {
		const term = searchTerm.toLowerCase().trim();
		return (!term || (p.descripcion||"").toLowerCase().includes(term) || (p.codigo||"").toLowerCase().includes(term)) &&
			(!filterCat || p.categoria === filterCat);
	});
</script>

<div class="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 flex flex-col">

	{#if msg.text}
		<div class="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-black text-sm animate-bounce
			{msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-black text-white'}">
			{msg.text}
		</div>
	{/if}

	{#if !isLoggedIn}
		<div class="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
			<div class="bg-white p-10 rounded-3xl w-full max-w-sm text-center shadow-2xl border-t-8 border-blue-600">
				<div class="text-6xl mb-6">🔒</div>
				<h2 class="text-2xl font-black mb-8 text-gray-900 tracking-tight">ACCESO ADMIN</h2>
				<input type="email" bind:value={email} class="w-full bg-gray-100 p-4 rounded-xl mb-3 font-bold text-center text-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Email">
				<input type="password" bind:value={passwordInput} class="w-full bg-gray-100 p-4 rounded-xl mb-8 font-bold text-center text-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password">
				<button on:click={login} class="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-lg shadow-blue-600/30">ENTRAR</button>
			</div>
		</div>
	{:else}

		<header class="bg-white border-b sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
			<div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 bg-black rounded-lg text-white flex items-center justify-center font-bold shadow-lg shadow-black/20">IA</div>
					<span class="font-bold text-gray-400 text-xs hidden sm:block">Panel v2.4 Turbo</span>
				</div>

				<div class="bg-gray-100 p-1 rounded-xl flex gap-1">
					<button on:click={() => viewMode = 'upload'} class="px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'upload' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">📤 Cargar</button>
					<button on:click={() => { viewMode = 'search'; resetForm(); }} class="px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'search' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">🔍 Buscar</button>
				</div>

				<div class="flex items-center gap-3">
					<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold hidden sm:block border border-blue-100">{inventory.length} Ítems</span>
					<button on:click={logout} class="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">SALIR</button>
				</div>
			</div>
		</header>

		<main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6">

			{#if viewMode === 'upload'}
				<div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
					<div class="p-5 border-b bg-gray-50/50 flex justify-between items-center">
						<h2 class="font-black text-lg text-gray-800 tracking-tight flex items-center gap-2">
							{form.id ? '✏️ EDITANDO' : '⚡ CARGA RÁPIDA'}
						</h2>
						{#if form.id}
							<button on:click={() => { resetForm(); viewMode = 'search'; }} class="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100">CANCELAR EDICIÓN</button>
						{/if}
					</div>

					<div class="p-6 lg:p-8 flex flex-col gap-6">
						<div class="flex flex-col md:flex-row gap-8">

							<div class="w-full md:w-1/3 flex flex-row md:flex-col gap-4">
								<div
									class="relative w-full aspect-square border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all overflow-hidden
									{isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400'}"
									on:click={() => document.getElementById('f1').click()}
									on:dragover={handleDragOver}
									on:dragleave={handleDragLeave}
									on:drop={(e) => handleDrop(e, 1)}
									role="button" tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && document.getElementById('f1').click()}
								>
									{#if preview1}
										<img src={preview1.startsWith('blob:') ? preview1 : `${preview1}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Principal">
										<div class="absolute top-2 right-2">
											<button type="button" class="bg-white/90 backdrop-blur text-red-500 w-8 h-8 rounded-full shadow-lg font-bold z-10 flex items-center justify-center hover:scale-110 transition-transform" on:click|stopPropagation={() => { file1 = null; preview1 = ''; form.imagen = ''; }}>✕</button>
										</div>
									{:else}
										<span class="text-5xl opacity-20 mb-2 group-hover:scale-110 transition-transform">📸</span>
										<span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Arrastra o Click<br>Principal</span>
									{/if}
									<input id="f1" type="file" hidden accept="image/*" on:change={(e) => handleFileSelect(e.target.files[0], 1)}>
								</div>

								<div
									class="relative w-full aspect-square border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all overflow-hidden
									{isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400'}"
									on:click={() => document.getElementById('f2').click()}
									on:dragover={handleDragOver}
									on:dragleave={handleDragLeave}
									on:drop={(e) => handleDrop(e, 2)}
									role="button" tabindex="0"
									on:keydown={(e) => e.key === 'Enter' && document.getElementById('f2').click()}
								>
									{#if preview2}
										<img src={preview2.startsWith('blob:') ? preview2 : `${preview2}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Extra">
										<div class="absolute top-2 right-2">
											<button type="button" class="bg-white/90 backdrop-blur text-red-500 w-8 h-8 rounded-full shadow-lg font-bold z-10 flex items-center justify-center hover:scale-110 transition-transform" on:click|stopPropagation={() => { file2 = null; preview2 = ''; form.imagen2 = ''; }}>✕</button>
										</div>
									{:else}
										<span class="text-5xl opacity-20 mb-2 group-hover:scale-110 transition-transform">➕</span>
										<span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Arrastra o Click<br>Extra</span>
									{/if}
									<input id="f2" type="file" hidden accept="image/*" on:change={(e) => handleFileSelect(e.target.files[0], 2)}>
								</div>
							</div>

							<div class="w-full md:w-2/3 space-y-4">
								<div>
									<label for="descripcion" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Descripción del Producto</label>
									<input
										bind:this={nameInputRef}
										id="descripcion"
										type="text"
										bind:value={form.descripcion}
										class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-lg text-gray-800 transition-all placeholder-gray-300"
										placeholder="Ej: Mini Licuadora Portátil...">
								</div>

								<div class="grid grid-cols-3 gap-3">
									<div class="col-span-1">
										<label for="categoria" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Categoría</label>
										<select id="categoria" bind:value={form.categoria} class="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-800 outline-none focus:bg-white focus:border-blue-300 cursor-pointer">
											<option value="">Elegir...</option>
											{#each categorias as c}<option value={c}>{c}</option>{/each}
										</select>
									</div>
									<div>
										<label for="codigo" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Código</label>
										<input id="codigo" type="text" bind:value={form.codigo} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs font-bold uppercase outline-none focus:border-blue-500 focus:bg-white" placeholder="A-001">
									</div>
									<div>
										<label for="moq" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Mínimo (MOQ)</label>
										<input id="moq" type="number" bind:value={form.moq} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center outline-none focus:border-blue-500 focus:bg-white">
									</div>
								</div>

								<div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4 items-center mt-4">
									<div class="flex-1 text-center border-r border-gray-200 pr-4">
										<label for="preciopormayor" class="text-[10px] font-black text-blue-600 uppercase mb-1 block tracking-wider">Precio Mayorista (Bs)</label>
										<input id="preciopormayor" type="number" step="0.01" bind:value={form.preciopormayor} class="w-full bg-transparent border-none p-0 text-3xl font-black text-blue-600 text-center outline-none focus:scale-110 transition-transform placeholder-blue-200" placeholder="0.00">
									</div>
									<div class="w-1/3 text-center pl-2">
										<label for="precioUnidad" class="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sugerido</label>
										<input id="precioUnidad" type="number" step="0.01" bind:value={form.precioUnidad} class="w-full bg-white border border-gray-200 p-2 rounded-xl text-lg font-bold text-gray-500 text-center outline-none focus:ring-2 focus:ring-gray-100">
									</div>
								</div>
							</div>
						</div>

						<button on:click={guardarProducto} disabled={loading} class="w-full mt-2 bg-black text-white font-black py-5 rounded-2xl text-lg shadow-xl shadow-gray-400/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
							{loading ? '⏳ GUARDANDO...' : (form.id ? '💾 ACTUALIZAR PRODUCTO' : '🚀 GUARDAR Y SEGUIR')}
						</button>
					</div>
				</div>
			{/if}

			{#if viewMode === 'search'}
				<div class="space-y-6">
					<div class="sticky top-20 z-20 max-w-3xl mx-auto">
						<div class="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-white flex gap-2">
							<div class="relative flex-1">
								<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
								<input type="text" bind:value={searchTerm} placeholder="Buscar por nombre o código..." class="w-full h-12 pl-12 pr-4 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300">
							</div>
							<select bind:value={filterCat} class="hidden sm:block h-12 px-6 bg-gray-50 rounded-xl font-bold text-xs text-gray-500 border-none outline-none cursor-pointer hover:bg-gray-100">
								<option value="">Todas las categorías</option>
								{#each categorias as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
					</div>

					{#if loading && inventory.length === 0}
						<div class="text-center py-24 opacity-50 font-bold tracking-widest animate-pulse">CARGANDO...</div>
					{:else}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
							{#each listaFiltrada as item (item.$id)}
								<div class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group h-[340px]">

									<div class="h-48 w-full bg-gray-50 relative p-4 flex items-center justify-center overflow-hidden">
										{#if item.imagen}
											<img src="{item.imagen}&width=400&height=400&quality=80&output=webp"
													 alt="img" loading="lazy"
													 class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 {item.disponible ? '' : 'grayscale opacity-60'}">
										{:else}
											<span class="text-4xl opacity-10">🖼️</span>
										{/if}

										<div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 uppercase shadow-sm">
											{item.codigo || 'SN'}
										</div>

										<div class="absolute bottom-3 right-3 bg-black text-white px-3 py-1 rounded-full text-sm font-black shadow-lg">
											Bs {item.preciopormayor}
										</div>
									</div>

									<div class="p-4 flex-1 flex flex-col justify-between bg-white relative">
										<div>
											<h3 class="font-bold text-gray-800 leading-snug line-clamp-2 mb-1 h-10" title={item.descripcion}>{item.descripcion}</h3>
											<p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.categoria}</p>
										</div>

										<div class="flex items-center justify-between pt-3 mt-2 border-t border-gray-50">

											<button
												on:click|stopPropagation={()=>toggleStock(item)}
												class="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors {item.disponible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}"
											>
												<div class="w-2 h-2 rounded-full {item.disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
												<span class="text-[10px] font-black uppercase">{item.disponible ? 'Stock' : 'Agotado'}</span>
											</button>

											<div class="flex gap-2">
												<button on:click={()=>editar(item)} class="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors" title="Editar">
													✏️
												</button>
												<button on:click={()=>venderPorWsp(item)} class="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors" title="Vender">
													📱
												</button>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</main>
	{/if}
</div>

<style>
    :global(body) { overflow-y: scroll; }
    /* Ocultar scrollbar pero permitir scroll */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>