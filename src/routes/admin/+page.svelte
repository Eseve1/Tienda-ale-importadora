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
				// Si editamos, volvemos a buscar para ver el cambio
				viewMode = 'search';
				resetForm();
			} else {
				const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
				inventory = [newDoc, ...inventory];
				showMsg("Creado: " + form.descripcion, "success");

				// MODO RÁFAGA: Mantenemos la categoría, borramos lo demás
				const currentCat = form.categoria;
				resetForm();
				form.categoria = currentCat; // Restauramos categoría para seguir cargando rápido

				// Auto-Focus al nombre
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
		setTimeout(() => msg = { text: "", type: "" }, 2000); // 2 segs es más rápido
	}

	function handleFile(e, num) {
		const f = e.target.files[0];
		if (f) {
			const url = URL.createObjectURL(f);
			if (num === 1) { file1 = f; preview1 = url; }
			else if (num === 2) { file2 = f; preview2 = url; }
		}
	}
	function triggerFile(id) { document.getElementById(id).click(); }

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

		<header class="bg-white border-b sticky top-0 z-30 shadow-sm">
			<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 bg-black rounded-lg text-white flex items-center justify-center font-bold">IA</div>
					<span class="font-bold text-gray-400 text-xs hidden sm:block">Panel v2.3 Turbo</span>
				</div>

				<div class="bg-gray-100 p-1 rounded-xl flex gap-1">
					<button on:click={() => viewMode = 'upload'} class="px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'upload' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">📤 Cargar</button>
					<button on:click={() => { viewMode = 'search'; resetForm(); }} class="px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'search' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">🔍 Buscar</button>
				</div>

				<div class="flex items-center gap-3">
					<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold hidden sm:block">{inventory.length}</span>
					<button on:click={logout} class="text-xs font-bold text-red-400 hover:text-red-600">SALIR</button>
				</div>
			</div>
		</header>

		<main class="flex-1 w-full max-w-6xl mx-auto p-4 lg:p-6">

			{#if viewMode === 'upload'}
				<div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
					<div class="p-5 border-b bg-gray-50 flex justify-between items-center">
						<h2 class="font-black text-lg text-gray-800 tracking-tight">{form.id ? '✏️ EDITANDO' : '⚡ CARGA RÁPIDA'}</h2>
						{#if form.id}
							<button on:click={() => { resetForm(); viewMode = 'search'; }} class="text-xs font-bold text-gray-400 hover:text-red-500">CANCELAR</button>
						{/if}
					</div>

					<div class="p-6 lg:p-8 space-y-6">

						<div class="grid grid-cols-2 gap-4 h-48">
							<div class="relative border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all" on:click={() => triggerFile('f1')} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFile('f1'); }} role="button" tabindex="0" aria-label="Subir imagen principal">
								{#if preview1}
									<img src={preview1.startsWith('blob:') ? preview1 : `${preview1}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Imagen principal">
									<div class="absolute top-2 right-2">
										<button type="button" class="bg-white text-red-500 w-6 h-6 rounded-full shadow-md font-bold z-10 flex items-center justify-center hover:scale-110" on:click|stopPropagation={() => { file1 = null; preview1 = ''; form.imagen = ''; }} aria-label="Eliminar imagen principal">✕</button>
									</div>
								{:else}
									<span class="text-4xl opacity-20 mb-1 group-hover:scale-110 transition-transform">📸</span>
									<span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PRINCIPAL</span>
								{/if}
								<input id="f1" type="file" hidden accept="image/*" on:change={(e) => handleFile(e, 1)}>
							</div>

							<div class="relative border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all" on:click={() => triggerFile('f2')} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFile('f2'); }} role="button" tabindex="0" aria-label="Subir imagen extra">
								{#if preview2}
									<img src={preview2.startsWith('blob:') ? preview2 : `${preview2}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Imagen extra">
									<div class="absolute top-2 right-2">
										<button type="button" class="bg-white text-red-500 w-6 h-6 rounded-full shadow-md font-bold z-10 flex items-center justify-center hover:scale-110" on:click|stopPropagation={() => { file2 = null; preview2 = ''; form.imagen2 = ''; }} aria-label="Eliminar imagen extra">✕</button>
									</div>
								{:else}
									<span class="text-4xl opacity-20 mb-1 group-hover:scale-110 transition-transform">➕</span>
									<span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">EXTRA</span>
								{/if}
								<input id="f2" type="file" hidden accept="image/*" on:change={(e) => handleFile(e, 2)}>
							</div>
						</div>

						<div class="space-y-4">
							<div>
								<label for="descripcion" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Descripción del Producto</label>
								<input
									bind:this={nameInputRef}
									id="descripcion"
									type="text"
									bind:value={form.descripcion}
									class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-lg text-gray-800 transition-all"
									placeholder="Ej: Mini Licuadora Portátil USB...">
							</div>

							<div class="grid grid-cols-3 gap-3">
								<div class="col-span-1">
									<label for="categoria" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Categoría</label>
									<select id="categoria" bind:value={form.categoria} class="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-800 outline-none focus:bg-white">
										<option value="">Elegir...</option>
										{#each categorias as c}<option value={c}>{c}</option>{/each}
									</select>
								</div>
								<div>
									<label for="codigo" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Código</label>
									<input id="codigo" type="text" bind:value={form.codigo} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs font-bold uppercase outline-none focus:border-blue-500" placeholder="A-001">
								</div>
								<div>
									<label for="moq" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Mínimo (MOQ)</label>
									<input id="moq" type="number" bind:value={form.moq} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center outline-none focus:border-blue-500">
								</div>
							</div>

							<div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4">
								<div class="flex-1 text-center">
									<label for="preciopormayor" class="text-[10px] font-black text-blue-600 uppercase mb-1 block">Mayorista (Bs)</label>
									<input id="preciopormayor" type="number" step="0.01" bind:value={form.preciopormayor} class="w-full bg-white border border-blue-200 p-2 rounded-xl text-2xl font-black text-blue-600 text-center outline-none focus:ring-4 focus:ring-blue-50">
								</div>
								<div class="w-1/3 text-center">
									<label for="precioUnidad" class="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sugerido</label>
									<input id="precioUnidad" type="number" step="0.01" bind:value={form.precioUnidad} class="w-full bg-white border border-gray-200 p-2 rounded-xl text-lg font-bold text-gray-500 text-center outline-none">
								</div>
							</div>
						</div>

						<button on:click={guardarProducto} disabled={loading} class="w-full bg-black text-white font-black py-5 rounded-2xl text-lg shadow-xl shadow-gray-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
							{loading ? '⏳ GUARDANDO...' : (form.id ? '💾 ACTUALIZAR' : '🚀 GUARDAR Y SIGUIENTE')}
						</button>
					</div>
				</div>
			{/if}

			{#if viewMode === 'search'}
				<div class="space-y-6">
					<div class="sticky top-20 z-20 max-w-3xl mx-auto">
						<div class="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex gap-2">
							<div class="relative flex-1">
								<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
								<input type="text" bind:value={searchTerm} placeholder="Buscar..." class="w-full h-12 pl-12 pr-4 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300">
							</div>
							<select bind:value={filterCat} class="hidden sm:block h-12 px-6 bg-gray-50 rounded-xl font-bold text-xs text-gray-500 border-none outline-none cursor-pointer hover:bg-gray-100">
								<option value="">Todas</option>
								{#each categorias as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
					</div>

					{#if loading && inventory.length === 0}
						<div class="text-center py-24 opacity-50 font-bold tracking-widest animate-pulse">CARGANDO...</div>
					{:else}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
							{#each listaFiltrada as item (item.$id)}
								<div class="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex gap-3 h-32 items-center relative overflow-hidden">

									<div class="h-24 w-24 bg-gray-50 rounded-xl shrink-0 border border-gray-100 flex items-center justify-center p-1">
										{#if item.imagen}
											<img src="{item.imagen}&width=200&height=200&quality=75&output=webp" alt="img" loading="lazy" class="w-full h-full object-contain mix-blend-multiply {item.disponible?'':'grayscale opacity-50'}">
										{:else}
											<span class="text-xl opacity-20">🖼️</span>
										{/if}
									</div>

									<div class="flex-1 min-w-0 flex flex-col justify-center py-1">
										<div class="flex justify-between items-start mb-1">
											<span class="text-[10px] font-black text-gray-400 bg-gray-50 px-1.5 rounded uppercase">{item.codigo || 'SN'}</span>
											<button on:click|stopPropagation={()=>toggleStock(item)} class="w-8 h-4 rounded-full relative transition-colors {item.disponible ? 'bg-green-500' : 'bg-gray-300'}" aria-label="Cambiar disponibilidad">
												<span class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform {item.disponible ? 'translate-x-4' : ''}"></span>
											</button>
										</div>
										<h3 class="font-bold text-sm text-gray-800 leading-tight line-clamp-2 mb-1">{item.descripcion}</h3>
										<span class="text-blue-600 font-black text-lg block">Bs {item.preciopormayor}</span>
									</div>

									<div class="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white to-transparent flex flex-col justify-center items-end pr-2 gap-2 translate-x-full group-hover:translate-x-0 transition-transform duration-200">
										<button on:click={()=>editar(item)} class="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:scale-110 shadow-sm">✏️</button>
										<button on:click={()=>venderPorWsp(item)} class="h-8 w-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:scale-110 shadow-sm">📱</button>
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
</style>