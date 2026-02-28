<script lang="ts">
	// @ts-nocheck
	import { onMount, tick } from 'svelte';
	import { Client, Databases, Storage, ID, Query, Account } from 'appwrite';

	const ENDPOINT      = "https://app.grupo59.com/v1";
	const PROJECT_ID    = "6978d1bc000bad7c5671";
	const DATABASE_ID   = "6978d1f3000ea0b56ebc";
	const COLLECTION_ID = "catalogo_ale";
	const CONFIG_ID     = "configuracion";
	const BUCKET_ID     = "6978d7a5001a8a5c7c9e";
	const PAGE_SIZE     = 1000;

	let client, db, storage, account;
	let isLoggedIn = false;
	let loading    = false;
	let viewMode   = 'upload'; // 'upload' | 'search' | 'config'
	let nameInputRef;

	let email         = "ed.severiche@gmail.com";
	let passwordInput = "";
	let loginError    = false;

	let inventory  = [];
	let searchTerm = "";
	let filterCat  = "";

	let msg       = { text: "", type: "" };
	let isDragging = false;

	// Descuento global
	let descuentoGlobal     = 0;
	let descuentoGlobalId   = null; // $id del documento en Appwrite
	let savingConfig        = false;

	// Formulario producto
	let form = {
		id: null, descripcion: "", codigo: "", categoria: "",
		precioUnidad: 0, preciopormayor: 0, moq: 6,
		imagen: "", imagen2: "", disponible: true,
		descuento: 0  // 0=usa global, -1=sin descuento, >0=propio %
	};
	let file1, file2, preview1, preview2;

	const categorias = ["Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	// Vista previa reactiva
	$: descuentoEfectivo = Number(form.descuento) === -1 ? 0
		: Number(form.descuento) > 0 ? Number(form.descuento)
			: descuentoGlobal;
	$: precioFinal = form.precioUnidad > 0 && descuentoEfectivo > 0
		? Number((form.precioUnidad * (1 - descuentoEfectivo / 100)).toFixed(2))
		: Number(form.precioUnidad);

	function fixUrl(url) {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	onMount(async () => {
		client  = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
		db      = new Databases(client);
		storage = new Storage(client);
		account = new Account(client);
		try {
			await account.get();
			isLoggedIn = true;
			await cargarConfig();
			cargarInventario();
		} catch (e) { isLoggedIn = false; }
	});

	async function login() {
		loading = true;
		try {
			await account.createEmailPasswordSession(email, passwordInput);
			isLoggedIn = true;
			await cargarConfig();
			cargarInventario();
		} catch (e) { loginError = true; setTimeout(()=>loginError=false, 2000); }
		loading = false;
	}

	async function logout() {
		await account.deleteSession('current');
		isLoggedIn = false;
	}

	async function cargarConfig() {
		try {
			const res = await db.listDocuments(DATABASE_ID, CONFIG_ID, [
				Query.equal('clave', 'descuento_global'), Query.limit(1)
			]);
			if (res.documents.length > 0) {
				descuentoGlobalId = res.documents[0].$id;
				descuentoGlobal   = parseInt(res.documents[0].valor) || 0;
			}
		} catch (e) { console.error(e); }
	}

	async function guardarConfig() {
		savingConfig = true;
		try {
			const data = { clave: 'descuento_global', valor: String(descuentoGlobal) };
			if (descuentoGlobalId) {
				await db.updateDocument(DATABASE_ID, CONFIG_ID, descuentoGlobalId, data);
			} else {
				const doc = await db.createDocument(DATABASE_ID, CONFIG_ID, ID.unique(), data);
				descuentoGlobalId = doc.$id;
			}
			showMsg("✅ Descuento global guardado", "success");
		} catch (e) {
			console.error(e);
			showMsg("Error al guardar config", "error");
		}
		savingConfig = false;
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
			let url1 = form.imagen, url2 = form.imagen2;
			if (file1) url1 = await uploadPhoto(file1);
			if (file2) url2 = await uploadPhoto(file2);

			const data = {
				descripcion: form.descripcion, codigo: form.codigo,
				categoria: form.categoria,
				preciopormayor: parseFloat(form.preciopormayor),
				precioUnidad: parseFloat(form.precioUnidad),
				moq: parseInt(form.moq),
				imagen: url1, imagen2: url2, disponible: form.disponible,
				descuento: parseInt(form.descuento) || 0
			};

			if (form.id) {
				await db.updateDocument(DATABASE_ID, COLLECTION_ID, form.id, data);
				const idx = inventory.findIndex(p => p.$id === form.id);
				if (idx > -1) inventory[idx] = { ...inventory[idx], ...data };
				showMsg("Producto Actualizado", "success");
				viewMode = 'search';
				resetForm();
			} else {
				const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
				inventory = [newDoc, ...inventory];
				showMsg("Creado: " + form.descripcion, "success");
				const currentCat  = form.categoria;
				const currentDesc = form.descuento;
				resetForm();
				form.categoria = currentCat;
				form.descuento = currentDesc;
				await tick();
				if (nameInputRef) nameInputRef.focus();
			}
		} catch (e) { console.error(e); showMsg("Error al guardar", "error"); }
		loading = false;
	}

	async function toggleStock(item) {
		const nuevoEstado = !item.disponible;
		item.disponible = nuevoEstado;
		inventory = [...inventory];
		try {
			await db.updateDocument(DATABASE_ID, COLLECTION_ID, item.$id, { disponible: nuevoEstado });
		} catch (e) { item.disponible = !nuevoEstado; inventory = [...inventory]; }
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
		form = { ...item, id: item.$id, descuento: item.descuento ?? 0 };
		preview1 = fixUrl(item.imagen);
		preview2 = fixUrl(item.imagen2);
		viewMode = 'upload';
	}

	function resetForm() {
		form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true, descuento: 0 };
		file1 = null; file2 = null; preview1 = ""; preview2 = "";
	}

	function showMsg(text, type) {
		msg = { text, type };
		setTimeout(() => msg = { text: "", type: "" }, 3000);
	}

	function handleFileSelect(file, num) {
		if (file) {
			const url = URL.createObjectURL(file);
			if (num === 1) { file1 = file; preview1 = url; }
			else           { file2 = file; preview2 = url; }
		}
	}
	function handleDrop(e, num) {
		e.preventDefault(); isDragging = false;
		const dt = e.dataTransfer;
		if (dt.files && dt.files[0]) handleFileSelect(dt.files[0], num);
	}
	function handleDragOver(e)  { e.preventDefault(); isDragging = true; }
	function handleDragLeave(e) { isDragging = false; }

	$: listaFiltrada = (!searchTerm && !filterCat) ? inventory : inventory.filter(p => {
		const term = searchTerm.toLowerCase().trim();
		return (!term || (p.descripcion||"").toLowerCase().includes(term) || (p.codigo||"").toLowerCase().includes(term)) &&
			(!filterCat || p.categoria === filterCat);
	});

	// Descuento efectivo para mostrar en las cards del admin
	function getDescuentoEfectivoItem(item) {
		const d = Number(item.descuento ?? 0);
		if (d === -1) return 0;
		if (d > 0)   return d;
		return descuentoGlobal;
	}
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
					<div class="h-8 w-8 bg-black rounded-lg text-white flex items-center justify-center font-bold">IA</div>
					<span class="font-bold text-gray-400 text-xs hidden sm:block">Panel v3.0</span>
				</div>

				<div class="bg-gray-100 p-1 rounded-xl flex gap-1">
					<button on:click={() => viewMode = 'upload'} class="px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'upload' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">📤 Cargar</button>
					<button on:click={() => { viewMode = 'search'; resetForm(); }} class="px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'search' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">🔍 Buscar</button>
					<button on:click={() => viewMode = 'config'} class="px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wide {viewMode === 'config' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}">⚙️ Config</button>
				</div>

				<div class="flex items-center gap-3">
					<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold hidden sm:block border border-blue-100">{inventory.length} Ítems</span>
					{#if descuentoGlobal > 0}
						<span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold hidden sm:block">-{descuentoGlobal}% global</span>
					{/if}
					<button on:click={logout} class="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">SALIR</button>
				</div>
			</div>
		</header>

		<main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6">

			<!-- ===== PESTAÑA CONFIG ===== -->
			{#if viewMode === 'config'}
				<div class="max-w-2xl mx-auto space-y-6">

					<!-- DESCUENTO GLOBAL -->
					<div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
						<div class="p-5 border-b bg-gray-50/50">
							<h2 class="font-black text-lg text-gray-800">⚙️ Configuración de Descuentos</h2>
							<p class="text-xs text-gray-400 mt-1">El descuento global aplica a todos los productos que no tienen un descuento propio asignado.</p>
						</div>

						<div class="p-6 space-y-6">

							<!-- % global -->
							<div>
								<label class="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-3">Descuento global para toda la tienda</label>
								<div class="flex flex-wrap gap-2 mb-4">
									{#each [0, 5, 10, 15, 20, 25, 30] as pct}
										<button
											type="button"
											on:click={() => descuentoGlobal = pct}
											class="px-4 py-2 rounded-xl text-sm font-black transition-all border-2
											{descuentoGlobal === pct
												? (pct === 0 ? 'bg-gray-700 text-white border-gray-700' : 'bg-blue-600 text-white border-blue-600')
												: 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'}"
										>
											{pct === 0 ? 'Sin descuento' : `-${pct}%`}
										</button>
									{/each}

									<div class="flex items-center gap-1 border-2 border-gray-200 rounded-xl px-3 hover:border-blue-300 transition-colors {!([0,5,10,15,20,25,30].includes(Number(descuentoGlobal))) ? 'border-blue-400 bg-blue-50' : ''}">
										<input type="number" min="0" max="99" bind:value={descuentoGlobal} class="w-12 bg-transparent text-sm font-black text-center outline-none text-gray-600" placeholder="0"/>
										<span class="text-xs font-bold text-gray-400">%</span>
									</div>
								</div>

								<!-- Vista previa global -->
								<div class="rounded-2xl p-4 {descuentoGlobal > 0 ? 'bg-blue-600' : 'bg-gray-100'}">
									{#if descuentoGlobal > 0}
										<p class="text-blue-200 text-xs font-bold uppercase mb-2">Efecto en la tienda:</p>
										<p class="text-white font-black text-base">Todos los productos mostrarán <span class="text-yellow-300">-{descuentoGlobal}%</span> de descuento automáticamente, salvo los que tengan descuento propio o estén excluidos.</p>
									{:else}
										<p class="text-gray-400 text-xs font-bold uppercase mb-2">Sin descuento global activo</p>
										<p class="text-gray-600 font-bold text-sm">Los productos mostrarán su precio original a menos que tengan un descuento propio asignado.</p>
									{/if}
								</div>
							</div>

							<button
								on:click={guardarConfig}
								disabled={savingConfig}
								class="w-full bg-black text-white font-black py-4 rounded-2xl text-base shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
							>
								{savingConfig ? '⏳ Guardando...' : '💾 GUARDAR CONFIGURACIÓN'}
							</button>
						</div>
					</div>

					<!-- GUÍA DE DESCUENTOS POR PRODUCTO -->
					<div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
						<div class="p-5 border-b bg-gray-50/50">
							<h3 class="font-black text-base text-gray-800">📖 Cómo funciona el descuento por producto</h3>
						</div>
						<div class="p-6 space-y-3">
							<div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
								<span class="text-2xl">0️⃣</span>
								<div>
									<p class="font-black text-sm text-gray-800">Descuento = 0 (por defecto)</p>
									<p class="text-xs text-gray-500 mt-0.5">El producto usa el descuento global que configuraste aquí arriba.</p>
								</div>
							</div>
							<div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
								<span class="text-2xl">🔢</span>
								<div>
									<p class="font-black text-sm text-blue-800">Descuento = 30 (por ejemplo)</p>
									<p class="text-xs text-blue-600 mt-0.5">El producto tiene su propio -30%, ignora el global.</p>
								</div>
							</div>
							<div class="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
								<span class="text-2xl">🚫</span>
								<div>
									<p class="font-black text-sm text-red-800">Descuento = -1 (excluir)</p>
									<p class="text-xs text-red-600 mt-0.5">El producto NO tiene ningún descuento aunque haya global activo. Para aplicarlo, ve a editar el producto y elige "Excluir del global".</p>
								</div>
							</div>
						</div>
					</div>

				</div>
			{/if}

			<!-- ===== PESTAÑA CARGAR ===== -->
			{#if viewMode === 'upload'}
				<div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
					<div class="p-5 border-b bg-gray-50/50 flex justify-between items-center">
						<h2 class="font-black text-lg text-gray-800">{form.id ? '✏️ EDITANDO' : '⚡ CARGA RÁPIDA'}</h2>
						{#if form.id}
							<button on:click={() => { resetForm(); viewMode = 'search'; }} class="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100">CANCELAR EDICIÓN</button>
						{/if}
					</div>

					<div class="p-6 lg:p-8 flex flex-col gap-6">
						<div class="flex flex-col md:flex-row gap-8">

							<!-- FOTOS -->
							<div class="w-full md:w-1/3 flex flex-row md:flex-col gap-4">
								<div class="relative w-full aspect-square border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all overflow-hidden {isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400'}"
										 on:click={() => document.getElementById('f1').click()}
										 on:dragover={handleDragOver} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, 1)}
										 role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && document.getElementById('f1').click()}
								>
									{#if preview1}
										<img src={preview1.startsWith('blob:') ? preview1 : `${fixUrl(preview1)}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Principal">
										<div class="absolute top-2 right-2">
											<button type="button" class="bg-white/90 backdrop-blur text-red-500 w-8 h-8 rounded-full shadow-lg font-bold z-10 flex items-center justify-center hover:scale-110 transition-transform" on:click|stopPropagation={() => { file1 = null; preview1 = ''; form.imagen = ''; }}>✕</button>
										</div>
									{:else}
										<span class="text-5xl opacity-20 mb-2 group-hover:scale-110 transition-transform">📸</span>
										<span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Arrastra o Click<br>Principal</span>
									{/if}
									<input id="f1" type="file" hidden accept="image/*" on:change={(e) => handleFileSelect(e.target.files[0], 1)}>
								</div>

								<div class="relative w-full aspect-square border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center bg-gray-50 group transition-all overflow-hidden {isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400'}"
										 on:click={() => document.getElementById('f2').click()}
										 on:dragover={handleDragOver} on:dragleave={handleDragLeave} on:drop={(e) => handleDrop(e, 2)}
										 role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && document.getElementById('f2').click()}
								>
									{#if preview2}
										<img src={preview2.startsWith('blob:') ? preview2 : `${fixUrl(preview2)}&width=400&quality=80&output=webp`} class="w-full h-full object-contain p-2" alt="Extra">
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

							<!-- CAMPOS -->
							<div class="w-full md:w-2/3 space-y-4">
								<div>
									<label for="descripcion" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Descripción del Producto</label>
									<input bind:this={nameInputRef} id="descripcion" type="text" bind:value={form.descripcion}
												 class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-lg text-gray-800 transition-all placeholder-gray-300"
												 placeholder="Ej: Mini Licuadora Portátil...">
								</div>

								<div class="grid grid-cols-3 gap-3">
									<div class="col-span-1">
										<label for="categoria" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Categoría</label>
										<select id="categoria" bind:value={form.categoria} class="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-800 outline-none focus:bg-white cursor-pointer">
											<option value="">Elegir...</option>
											{#each categorias as c}<option value={c}>{c}</option>{/each}
										</select>
									</div>
									<div>
										<label for="codigo" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Código</label>
										<input id="codigo" type="text" bind:value={form.codigo} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs font-bold uppercase outline-none focus:border-blue-500 focus:bg-white" placeholder="A-001">
									</div>
									<div>
										<label for="moq" class="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">MOQ</label>
										<input id="moq" type="number" bind:value={form.moq} class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center outline-none focus:border-blue-500 focus:bg-white">
									</div>
								</div>

								<!-- PRECIOS -->
								<div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-4 items-center">
									<div class="flex-1 text-center border-r border-gray-200 pr-4">
										<label for="preciopormayor" class="text-[10px] font-black text-blue-600 uppercase mb-1 block tracking-wider">Precio Mayorista (Bs)</label>
										<input id="preciopormayor" type="number" step="0.01" bind:value={form.preciopormayor} class="w-full bg-transparent border-none p-0 text-3xl font-black text-blue-600 text-center outline-none placeholder-blue-200" placeholder="0.00">
									</div>
									<div class="w-1/3 text-center pl-2">
										<label for="precioUnidad" class="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Precio Unidad</label>
										<input id="precioUnidad" type="number" step="0.01" bind:value={form.precioUnidad} class="w-full bg-white border border-gray-200 p-2 rounded-xl text-lg font-bold text-gray-500 text-center outline-none focus:ring-2 focus:ring-gray-100">
									</div>
								</div>

								<!-- DESCUENTO POR PRODUCTO -->
								<div class="rounded-2xl border-2 overflow-hidden {Number(form.descuento) === -1 ? 'border-red-200' : Number(form.descuento) > 0 ? 'border-blue-200' : 'border-gray-200'}">

									<!-- Header -->
									<div class="flex items-center justify-between px-4 py-3 border-b {Number(form.descuento) === -1 ? 'bg-red-50 border-red-100' : Number(form.descuento) > 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}">
										<span class="text-xs font-black uppercase tracking-wider {Number(form.descuento) === -1 ? 'text-red-600' : Number(form.descuento) > 0 ? 'text-blue-700' : 'text-gray-400'}">
											🏷️ Descuento en Precio Unidad
										</span>
										{#if Number(form.descuento) === -1}
											<span class="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">Excluido del global</span>
										{:else if Number(form.descuento) > 0}
											<span class="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">-{form.descuento}% propio</span>
										{:else}
											<span class="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Usa global ({descuentoGlobal}%)</span>
										{/if}
									</div>

									<!-- Botones rápidos -->
									<div class="px-4 pt-3 pb-2">
										<p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Descuento para este producto:</p>
										<div class="flex flex-wrap gap-2">
											<button type="button" on:click={() => form.descuento = 0}
															class="px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 {Number(form.descuento) === 0 ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}">
												Usar global
											</button>
											{#each [5, 10, 15, 20, 25, 30] as pct}
												<button type="button" on:click={() => form.descuento = pct}
																class="px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 {Number(form.descuento) === pct ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'}">
													-{pct}%
												</button>
											{/each}
											<!-- Excluir del global -->
											<button type="button" on:click={() => form.descuento = -1}
															class="px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 {Number(form.descuento) === -1 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-400 border-red-200 hover:border-red-400'}">
												🚫 Sin desc.
											</button>
											<!-- Input personalizado -->
											<div class="flex items-center gap-1 border-2 border-gray-200 rounded-lg px-2 hover:border-blue-300 transition-colors {![0,-1,5,10,15,20,25,30].includes(Number(form.descuento)) ? 'border-blue-400 bg-blue-50' : ''}">
												<input type="number" min="1" max="99" bind:value={form.descuento}
															 class="w-10 bg-transparent text-xs font-black text-center outline-none text-gray-600" placeholder="%"/>
												<span class="text-[10px] font-bold text-gray-400">%</span>
											</div>
										</div>
									</div>

									<!-- Vista previa -->
									{#if form.precioUnidad > 0}
										<div class="mx-4 mb-4 mt-2 rounded-xl p-3 flex items-center justify-between gap-3 {Number(form.descuento) === -1 ? 'bg-red-50' : descuentoEfectivo > 0 ? 'bg-blue-600' : 'bg-gray-100'}">
											{#if Number(form.descuento) === -1}
												<div class="text-center w-full">
													<p class="text-xs font-bold text-red-500 uppercase mb-1">Sin descuento — precio completo</p>
													<p class="text-2xl font-black text-red-700">Bs. {Number(form.precioUnidad).toFixed(2)}</p>
												</div>
											{:else}
												<div class="text-center flex-1">
													<p class="text-[10px] font-bold {descuentoEfectivo > 0 ? 'text-blue-200' : 'text-gray-400'} uppercase mb-0.5">Precio guardado</p>
													<p class="text-lg font-black {descuentoEfectivo > 0 ? 'text-white/70 line-through' : 'text-gray-700'}">Bs. {Number(form.precioUnidad).toFixed(2)}</p>
												</div>
												{#if descuentoEfectivo > 0}
													<div class="text-blue-300 text-xl">→</div>
													<div class="text-center flex-1">
														<p class="text-[10px] font-bold text-blue-200 uppercase mb-0.5">Cliente ve</p>
														<p class="text-2xl font-black text-white">Bs. {precioFinal.toFixed(2)}</p>
														<p class="text-[10px] text-blue-300 font-bold">-{descuentoEfectivo}%</p>
													</div>
												{:else}
													<div class="text-center flex-1">
														<p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Cliente ve</p>
														<p class="text-2xl font-black text-gray-700">Bs. {precioFinal.toFixed(2)}</p>
													</div>
												{/if}
											{/if}
										</div>
									{/if}
								</div>

							</div>
						</div>

						<button on:click={guardarProducto} disabled={loading} class="w-full mt-2 bg-black text-white font-black py-5 rounded-2xl text-lg shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
							{loading ? '⏳ GUARDANDO...' : (form.id ? '💾 ACTUALIZAR PRODUCTO' : '🚀 GUARDAR Y SEGUIR')}
						</button>
					</div>
				</div>
			{/if}

			<!-- ===== PESTAÑA BUSCAR ===== -->
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
								{@const descEfectivo = getDescuentoEfectivoItem(item)}
								<div class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group h-[370px]">

									<div class="h-48 w-full bg-gray-50 relative p-4 flex items-center justify-center overflow-hidden">
										{#if item.imagen}
											<img src="{fixUrl(item.imagen)}&width=400&height=400&quality=80&output=webp" alt="img" loading="lazy"
													 class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110 {item.disponible ? '' : 'grayscale opacity-60'}">
										{:else}
											<span class="text-4xl opacity-10">🖼️</span>
										{/if}
										<div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 uppercase shadow-sm">
											{item.codigo || 'SN'}
										</div>
										{#if descEfectivo > 0}
											<div class="absolute bottom-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-black shadow-sm">
												-{descEfectivo}%
											</div>
										{:else if Number(item.descuento) === -1}
											<div class="absolute bottom-3 right-3 bg-gray-400 text-white px-2 py-1 rounded-md text-[10px] font-black shadow-sm">
												🚫 excluido
											</div>
										{/if}
									</div>

									<div class="p-4 flex-1 flex flex-col justify-between bg-white">
										<div class="flex items-start justify-between gap-2">
											<div class="flex-1 min-w-0">
												<h3 class="font-bold text-gray-800 leading-snug line-clamp-2 mb-1">{item.descripcion}</h3>
												<p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.categoria}</p>
											</div>
											<div class="bg-black text-white px-2.5 py-1.5 rounded-xl flex flex-col items-end leading-tight shrink-0">
												<span class="text-sm font-black">Bs {(item.preciopormayor * (item.moq || 12)).toFixed(2)}</span>
												<span class="text-[9px] font-bold opacity-60">x{item.moq || 12} · Bs {item.preciopormayor} c/u</span>
											</div>
										</div>

										<!-- Precio unidad con descuento efectivo -->
										<div class="flex items-center gap-2 mt-1">
											{#if descEfectivo > 0}
												<span class="text-[11px] text-gray-400 line-through font-bold">Bs. {Number(item.precioUnidad).toFixed(2)}</span>
												<span class="text-[13px] text-blue-600 font-black">Bs. {(item.precioUnidad * (1 - descEfectivo/100)).toFixed(2)}</span>
												<span class="text-[9px] bg-blue-100 text-blue-600 font-black px-1.5 py-0.5 rounded">
													{Number(item.descuento) > 0 ? 'propio' : 'global'}
												</span>
											{:else if Number(item.descuento) === -1}
												<span class="text-[13px] text-gray-600 font-bold">Bs. {Number(item.precioUnidad).toFixed(2)}</span>
												<span class="text-[9px] bg-red-100 text-red-500 font-black px-1.5 py-0.5 rounded">sin desc.</span>
											{:else}
												<span class="text-[13px] text-gray-600 font-bold">Bs. {Number(item.precioUnidad).toFixed(2)}</span>
												<span class="text-[9px] bg-gray-100 text-gray-400 font-bold px-1.5 py-0.5 rounded">precio completo</span>
											{/if}
										</div>

										<div class="flex items-center justify-between pt-3 mt-2 border-t border-gray-50">
											<button on:click|stopPropagation={()=>toggleStock(item)}
															class="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors {item.disponible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}">
												<div class="w-2 h-2 rounded-full {item.disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
												<span class="text-[10px] font-black uppercase">{item.disponible ? 'Stock' : 'Agotado'}</span>
											</button>
											<div class="flex gap-2">
												<button on:click={()=>editar(item)} class="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors">✏️</button>
												<button on:click={()=>venderPorWsp(item)} class="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors">📱</button>
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
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>