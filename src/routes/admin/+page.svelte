<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { Client, Databases, Storage, ID, Query } from 'appwrite';

	const ADMIN_PASS = "eddy4242";

	// --- CREDENCIALES ---
	const ENDPOINT = "https://api.importadoraale.app/v1";
	const PROJECT_ID = "6978d1bc000bad7c5671";
	const DATABASE_ID = "6978d1f3000ea0b56ebc";
	const COLLECTION_ID = "catalogo_ale";

	// 🔴 CORRECCIÓN: Este es el ID Real de tu Storage (Bucket)
	const BUCKET_ID = "6978d7a5001a8a5c7c9e";

	// Sistemas
	let client, db, storage;
	let isLoggedIn = false;
	let passwordInput = "";
	let loginError = false;

	// Datos
	let inventory = [];
	let loading = false;
	let searchTerm = "";
	let filterCat = "";
	let msg = { text: "", type: "" };
	let showForm = false;

	// Formulario
	let form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
	let file1, file2, preview1, preview2;

	const categorias = ["Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	onMount(() => {
		client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
		db = new Databases(client);
		storage = new Storage(client);
	});

	function login() {
		if (passwordInput === ADMIN_PASS) { isLoggedIn = true; cargarInventario(); }
		else { loginError = true; setTimeout(() => loginError = false, 2000); }
	}

	async function cargarInventario() {
		loading = true;
		try {
			const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
				Query.limit(5000),
				Query.orderDesc('$createdAt')
			]);
			inventory = res.documents;
		} catch (e) { mostrarMensaje("Error: " + e.message, "error"); }
		loading = false;
	}

	// --- FILTRO ---
	$: listaFiltrada = (!searchTerm && !filterCat)
		? []
		: inventory.filter(p => {
			const term = searchTerm.toLowerCase().trim();
			const matchesSearch = !term || (p.descripcion || "").toLowerCase().includes(term) || (p.codigo || "").toLowerCase().includes(term);
			const matchesCat = !filterCat || p.categoria === filterCat;
			return matchesSearch && matchesCat;
		});

	$: totalInventario = inventory.length;

	async function guardarProducto() {
		loading = true;
		try {
			let url1 = form.imagen;
			let url2 = form.imagen2;

			// Subimos fotos nuevas si existen
			if (file1) url1 = await uploadPhoto(file1);
			if (file2) url2 = await uploadPhoto(file2);

			// Manejo adecuado de la excepción lanzada
			if (!url1) {
				console.error("La foto principal es obligatoria");
				return;
			}

			// Preparamos los datos asegurando que los números sean números
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
				// MODO EDICIÓN
				await db.updateDocument(DATABASE_ID, COLLECTION_ID, form.id, data);

				// Actualizamos la lista localmente para no recargar todo
				const idx = inventory.findIndex(p => p.$id === form.id);
				if(idx > -1) inventory[idx] = { ...inventory[idx], ...data };

				mostrarMensaje("Producto actualizado correctamente", "success");
			} else {
				// MODO CREACIÓN
				const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
				inventory = [newDoc, ...inventory];
				mostrarMensaje("Producto creado exitosamente", "success");
			}

			resetForm();
			showForm = false;
		} catch (e) {
			console.error(e);
			mostrarMensaje("Error: " + e.message, "error");
		} finally {
			loading = false;
		}
	}

	async function uploadPhoto(file) {
		// Usamos el BUCKET_ID corregido
		const up = await storage.createFile(BUCKET_ID, ID.unique(), file);
		// Retornamos la URL pública con el Project ID para que sea visible
		return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${up.$id}/view?project=${PROJECT_ID}`;
	}

	async function toggleStock(item) {
		const nuevoEstado = !item.disponible;
		// Optimistic UI update (cambiamos visualmente primero)
		item.disponible = nuevoEstado;
		inventory = [...inventory];

		try {
			await db.updateDocument(DATABASE_ID, COLLECTION_ID, item.$id, { disponible: nuevoEstado });
		} catch (e) {
			// Si falla, revertimos
			item.disponible = !nuevoEstado;
			inventory = [...inventory];
			mostrarMensaje("No tienes permiso para editar stock", "error");
		}
	}

	async function borrar(id) {
		if(!confirm("¿Estás seguro de borrar este producto?")) return;
		try {
			await db.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
			inventory = inventory.filter(p => p.$id !== id);
			mostrarMensaje("Producto eliminado", "success");
		}
		catch(e) { mostrarMensaje("Error al borrar (Revisa permisos)", "error"); }
	}

	function venderPorWsp(item) {
		const texto = `Hola! Te envío el detalle:\n\n📦 *${item.descripcion}*\n🔖 Ref: ${item.codigo || 'S/N'}\n💰 Precio: *Bs ${item.preciopormayor}*\n\nVer foto: ${item.imagen}`;
		const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
		window.open(url, '_blank');
	}

	function editar(item) {
		form = { ...item, id: item.$id };
		preview1 = item.imagen;
		preview2 = item.imagen2;
		showForm = true;
	}

	function resetForm() {
		form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
		file1 = null; file2 = null; preview1 = ""; preview2 = "";
	}

	function handleFile(e, num) {
		const f = e.target.files[0];
		if (f) {
			if (num === 1) { file1 = f; preview1 = URL.createObjectURL(f); }
			else { file2 = f; preview2 = URL.createObjectURL(f); }
		}
	}
	function triggerFile(id) { document.getElementById(id).click(); }

	function handleFileKeydown(e, id) {
		if (e.key === 'Enter' || e.key === ' ') {
			triggerFile(id);
		}
	}

	function mostrarMensaje(t, type) {
		msg = { text: t, type };
		setTimeout(() => msg = { text: "", type: "" }, 3000);
	}

	function validatePhoto(url1) {
		if (!url1) {
			return "La foto principal es obligatoria";
		}
		return null;
	}
</script>

<div class="h-screen flex flex-col bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">

	{#if !isLoggedIn}
		<div class="fixed inset-0 bg-[#111] flex items-center justify-center z-50 p-4">
			<div class="bg-white p-10 rounded-2xl text-center max-w-sm w-full shadow-2xl border-t-4 border-blue-600">
				<div class="text-6xl mb-6">🔐</div>
				<h2 class="text-xl font-bold mb-2 text-gray-800 tracking-tight">ACCESO SEGURO</h2>
				<p class="text-xs text-gray-400 mb-8 uppercase tracking-widest font-bold">Importadora Ale Admin</p>
				<input type="password" bind:value={passwordInput} class="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 focus:bg-white p-4 rounded-lg text-center text-lg outline-none transition-all font-bold tracking-widest" placeholder="••••••••">
				<button on:click={login} class="w-full bg-blue-600 text-white font-bold py-4 rounded-lg mt-6 hover:bg-blue-700 transition-transform active:scale-95 shadow-lg">
					INICIAR SESIÓN
				</button>
				{#if loginError}<p class="text-red-500 mt-4 font-bold text-xs uppercase tracking-wide animate-pulse">Acceso Denegado</p>{/if}
			</div>
		</div>
	{/if}

	{#if isLoggedIn}
		<header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm shrink-0 z-20">
			<div class="flex items-center gap-3">
				<div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">A</div>
				<span class="font-bold text-lg text-gray-800 hidden md:block tracking-tight">Panel de Control</span>
				<div class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase tracking-wide flex items-center gap-1">
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
				</div>
			</div>
			<div class="flex items-center gap-4">
				<div class="text-right flex items-center gap-3 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
					<span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Productos</span>
					<span class="text-lg font-black text-blue-600">{totalInventario}</span>
				</div>
			</div>
		</header>

		<div class="flex-1 flex overflow-hidden">
			<aside class="{showForm ? 'fixed inset-0 z-50 bg-white flex flex-col' : 'hidden'} lg:block lg:static lg:w-[400px] lg:bg-white lg:border-r lg:border-gray-200 overflow-y-auto custom-scrollbar shadow-2xl lg:shadow-none shrink-0">
				<div class="lg:hidden p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10 shrink-0">
					<h2 class="font-bold text-lg text-gray-700">{form.id ? 'Editar' : 'Nuevo'}</h2>
					<button on:click={() => showForm = false} class="bg-gray-200 p-2 rounded-full text-gray-600 font-bold w-10 h-10 flex items-center justify-center active:bg-gray-300">✕</button>
				</div>

				<div class="p-6 space-y-5 flex-1 overflow-y-auto">
					<div class="hidden lg:flex justify-between items-center pb-4 border-b border-gray-100">
						<h2 class="font-bold text-lg text-gray-800 flex items-center gap-2">
							{form.id ? '✏️ Editando Item' : '➕ Nuevo Item'}
						</h2>
						{#if form.id}
							<button on:click={resetForm} class="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors">Cancelar</button>
						{/if}
					</div>

					<div class="space-y-5">
						<div>
							<span class="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Descripción</span>
							<input type="text" bind:value={form.descripcion} class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-gray-700 transition-all" placeholder="Nombre completo...">
						</div>
						<div>
							<span class="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Código / Referencia</span>
							<input type="text" bind:value={form.codigo} class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-mono text-sm uppercase text-gray-600" placeholder="A-001">
						</div>
						<div>
							<span class="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Categoría</span>
							<select bind:value={form.categoria} class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm text-gray-600 font-medium">
								<option value="">Seleccionar categoría...</option>
								{#each categorias as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
						<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
							<div>
								<span class="text-[11px] font-black text-blue-600 uppercase mb-1.5 block">Precio Mayorista</span>
								<div class="relative">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">Bs</span>
									<input type="number" step="0.01" bind:value={form.preciopormayor} class="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg font-black text-blue-600 text-xl outline-none focus:border-blue-500 shadow-sm">
								</div>
							</div>
							<div>
								<span class="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Precio Unidad / Sugerido</span>
								<div class="relative">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Bs</span>
									<input type="number" step="0.01" bind:value={form.precioUnidad} class="w-full pl-8 p-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 font-medium outline-none focus:border-gray-400">
								</div>
							</div>
						</div>
						<div>
							<span class="text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Cantidad Mínima (MOQ)</span>
							<input type="number" bind:value={form.moq} class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 outline-none font-bold text-gray-700">
						</div>
					</div>

					<div class="flex gap-3 pt-2">
						<div
							class="h-24 w-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group bg-white shrink-0"
							on:click={()=>triggerFile('f1')}
							on:keydown={(e)=>handleFileKeydown(e, 'f1')}
							role="button"
							tabindex="0"
						>
							{#if preview1}
								<img src={preview1} class="w-full h-full object-cover" alt="p1">
								<button class="absolute top-1 right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-50" on:click|stopPropagation={()=>{file1=null;preview1="";form.imagen=""}}>✕</button>
							{:else}
								<span class="text-xl opacity-30 group-hover:opacity-100 transition-opacity">📸</span>
								<span class="text-[8px] font-bold text-gray-400 uppercase mt-1 group-hover:text-blue-600">Principal</span>
							{/if}
							<input id="f1" type="file" hidden accept="image/*" on:change={(e)=>handleFile(e,1)}>
						</div>

						<div
							class="h-24 w-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group bg-white shrink-0"
							on:click={()=>triggerFile('f2')}
							on:keydown={(e)=>handleFileKeydown(e, 'f2')}
							role="button"
							tabindex="0"
						>
							{#if preview2}
								<img src={preview2} class="w-full h-full object-cover" alt="p2">
								<button class="absolute top-1 right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-50" on:click|stopPropagation={()=>{file2=null;preview2="";form.imagen2=""}}>✕</button>
							{:else}
								<span class="text-xl opacity-20 group-hover:opacity-100 transition-opacity">📷</span>
								<span class="text-[8px] font-bold text-gray-300 uppercase mt-1 group-hover:text-blue-600">Extra</span>
							{/if}
							<input id="f2" type="file" hidden accept="image/*" on:change={(e)=>handleFile(e,2)}>
						</div>
					</div>

					<div class="pt-4 flex flex-col gap-3 mt-auto">
						<button
							on:click={guardarProducto}
							disabled={loading}
							class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-wide"
						>
							{loading ? 'Procesando...' : (form.id ? 'Guardar Cambios' : 'Crear Producto')}
						</button>
					</div>

					{#if msg.text}
						<div class="p-3 text-center text-xs rounded-lg font-bold {msg.type==='error'?'bg-red-50 text-red-600 border border-red-100':'bg-green-50 text-green-600 border border-green-100'}">
							{msg.text}
						</div>
					{/if}
				</div>
			</aside>

			<main class="flex-1 bg-[#f8f9fa] overflow-y-auto custom-scrollbar p-4 lg:p-8 relative min-w-0">
				<div class="sticky top-0 z-30 mb-6 max-w-4xl mx-auto">
					<div class="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex gap-2">
						<div class="relative flex-1">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
							<input
								id="search-inv"
								type="text"
								bind:value={searchTerm}
								placeholder="Buscar por nombre o código..."
								class="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-base font-medium text-gray-700 placeholder-gray-400"
							>
						</div>
						<select bind:value={filterCat} class="h-12 px-4 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border-l border-gray-200 outline-none hover:bg-gray-100 cursor-pointer max-w-[160px] hidden sm:block">
							<option value="">Todas las Categorías</option>
							{#each categorias as c}<option value={c}>{c}</option>{/each}
						</select>
					</div>
				</div>

				<div class="max-w-7xl mx-auto min-h-[500px]">
					{#if loading && inventory.length === 0}
						<div class="flex flex-col items-center justify-center py-32 opacity-40">
							<div class="animate-spin text-3xl mb-4 text-blue-500">⏳</div>
							<span class="font-bold text-xs text-gray-500 uppercase tracking-widest">Conectando base de datos...</span>
						</div>
					{:else if listaFiltrada.length === 0}
						<div class="flex flex-col items-center justify-center py-24 text-center">
							{#if !searchTerm && !filterCat}
								<div class="bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
									<span class="text-5xl">💼</span>
								</div>
								<h3 class="text-xl font-bold text-gray-800">Panel Administrativo</h3>
								<p class="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Utiliza el buscador superior para gestionar tu inventario o crea un producto nuevo.</p>
							{:else}
								<span class="text-5xl mb-4 opacity-20">📂</span>
								<h3 class="text-lg font-bold text-gray-400">No se encontraron resultados</h3>
							{/if}
						</div>
					{:else}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-24">
							{#each listaFiltrada as item (item.$id)}
								<div class="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3 relative transition-all hover:shadow-lg hover:border-blue-200 group {item.disponible ? '' : 'opacity-60 bg-gray-50'}">
									<div class="absolute top-3 right-3 z-10 flex gap-1">
										<button
											on:click={()=>toggleStock(item)}
											class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {item.disponible ? 'bg-green-500' : 'bg-gray-200'}"
										>
											<span class="sr-only">Stock</span>
											<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {item.disponible ? 'translate-x-6' : 'translate-x-1'} shadow-sm"></span>
										</button>
									</div>

									<div class="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-gray-100">
										{#if item.imagen}
											<img src={item.imagen} alt={item.descripcion} class="w-full h-full object-contain mix-blend-multiply">
										{:else}
											<span class="text-3xl opacity-20">📦</span>
										{/if}
									</div>

									<div class="flex-1 flex flex-col">
										<div class="flex items-center gap-2 mb-1">
											<span class="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide border border-gray-200">{item.codigo || 'S/N'}</span>
											{#if !item.disponible}
												<span class="text-[9px] font-black text-red-500 uppercase tracking-widest">AGOTADO</span>
											{/if}
										</div>
										<div class="font-medium text-sm text-gray-800 leading-snug line-clamp-2 mb-3 h-10" title={item.descripcion}>{item.descripcion}</div>

										<div class="mt-auto flex items-end justify-between border-t border-gray-100 pt-2">
											<div>
												<span class="text-[9px] font-bold text-gray-400 block uppercase">Mayorista</span>
												<span class="text-blue-600 font-black text-lg">Bs {item.preciopormayor}</span>
											</div>
											<div class="flex gap-1">
												<button on:click={()=>venderPorWsp(item)} class="h-8 w-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors shadow-sm" title="Enviar por WhatsApp">
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
												</button>
												<button on:click={()=>editar(item)} class="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm" title="Editar">✏️</button>
												<button on:click={()=>borrar(item.$id)} class="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm" title="Borrar">🗑️</button>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</main>
		</div>

		<button
			class="lg:hidden fixed bottom-6 right-6 h-14 w-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 z-40 flex items-center justify-center text-3xl font-light active:scale-90 transition-transform"
			on:click={() => { showForm = true; if(showForm) resetForm(); }}
			aria-label="Crear nuevo producto"
		>
			+
		</button>
	{/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
</style>