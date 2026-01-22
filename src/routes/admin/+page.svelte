<script>
	import { onMount, onDestroy } from 'svelte';
	import { Client, Databases, Storage, ID, Query } from 'appwrite';

	// --- CONFIGURACIÓN ---
	const ADMIN_PASS = "eddy4242";
	const PROJECT_ID = "692ee6b70012153cd33c";
	const DATABASE_ID = "692ee774002e9a3c8601";
	const COLLECTION_ID = "catalogo";
	const BUCKET_ID = "692ef19e001ffa75d062";

	// --- VARIABLES ---
	let client, db, storage;
	let isLoggedIn = false;
	let passwordInput = "";
	let loginError = false;

	let inventory = [];
	let loading = false;
	let searchTerm = "";
	let msg = { text: "", type: "" };

	let form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
	let file1, file2, preview1, preview2;

	const categorias = ["Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	onMount(() => {
		client = new Client().setEndpoint("https://cloud.appwrite.io/v1").setProject(PROJECT_ID);
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

	$: listaFiltrada = inventory.filter(p => {
		const term = searchTerm.toLowerCase().trim();
		if (!term) return true;
		const desc = (p.descripcion || "").toLowerCase();
		const cod = (p.codigo || "").toLowerCase();
		return desc.includes(term) || cod.includes(term);
	});

	async function guardarProducto() {
		loading = true;
		try {
			let url1 = form.imagen, url2 = form.imagen2;
			if (file1) url1 = await uploadPhoto(file1);
			if (file2) url2 = await uploadPhoto(file2);

			if (!url1) throw new Error("Foto principal obligatoria");

			const data = {
				descripcion: form.descripcion, codigo: form.codigo, categoria: form.categoria,
				preciopormayor: parseFloat(form.preciopormayor), precioUnidad: parseFloat(form.precioUnidad),
				moq: parseInt(form.moq), imagen: url1, imagen2: url2, disponible: form.disponible
			};

			if (form.id) {
				await db.updateDocument(DATABASE_ID, COLLECTION_ID, form.id, data);
				const idx = inventory.findIndex(p => p.$id === form.id);
				if(idx > -1) inventory[idx] = { ...inventory[idx], ...data };
				mostrarMensaje("Actualizado", "success");
			} else {
				const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
				inventory = [newDoc, ...inventory];
				mostrarMensaje("Creado", "success");
			}
			resetForm();
		} catch (e) { mostrarMensaje(e.message, "error"); }
		loading = false;
	}

	async function uploadPhoto(file) {
		const up = await storage.createFile(BUCKET_ID, ID.unique(), file);
		return `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${up.$id}/view?project=${PROJECT_ID}`;
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
			mostrarMensaje("Error al cambiar estado", "error");
		}
	}

	async function borrar(id) {
		if(!confirm("¿Borrar?")) return;
		try { await db.deleteDocument(DATABASE_ID, COLLECTION_ID, id); inventory = inventory.filter(p => p.$id !== id); }
		catch(e) { mostrarMensaje("Error borrando", "error"); }
	}

	function editar(item) {
		form = { ...item, id: item.$id }; preview1 = item.imagen; preview2 = item.imagen2;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
		file1 = null; file2 = null; preview1 = ""; preview2 = "";
	}

	function handleFile(e, num) {
		const f = e.target.files[0];
		if (f) { if (num === 1) { file1 = f; preview1 = URL.createObjectURL(f); } else { file2 = f; preview2 = URL.createObjectURL(f); } }
	}
	function triggerFile(id) { document.getElementById(id).click(); }
	function mostrarMensaje(t, type) { msg = { text: t, type }; setTimeout(() => msg = { text: "", type: "" }, 3000); }
</script>

<div class="min-h-screen bg-gray-100 font-sans text-gray-800 p-4">
	{#if !isLoggedIn}
		<div class="fixed inset-0 bg-black flex items-center justify-center z-50">
			<div class="bg-white p-8 rounded-xl text-center max-w-sm w-full">
				<h2 class="text-xl font-bold mb-4">Admin</h2>
				<label for="admin-pass" class="sr-only">Contraseña</label>
				<input id="admin-pass" type="password" bind:value={passwordInput} class="w-full border p-2 rounded mb-4 text-center" placeholder="Contraseña">
				<button on:click={login} class="w-full bg-yellow-500 text-white font-bold py-2 rounded">Entrar</button>
				{#if loginError}<p class="text-red-500 mt-2 text-sm">Incorrecto</p>{/if}
			</div>
		</div>
	{/if}

	{#if isLoggedIn}
		<div class="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
			<div class="lg:col-span-4 h-fit bg-white p-6 rounded-xl shadow-sm border">
				<h2 class="font-bold text-lg mb-4">{form.id ? '✏️ Editando' : '✨ Nuevo'}</h2>
				<div class="space-y-3">
					<div>
						<label for="f-nombre" class="text-xs font-bold text-gray-500">Nombre</label>
						<input id="f-nombre" type="text" bind:value={form.descripcion} class="w-full p-2 border rounded">
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="f-codigo" class="text-xs font-bold text-gray-500">Código</label>
							<input id="f-codigo" type="text" bind:value={form.codigo} class="w-full p-2 border rounded">
						</div>
						<div>
							<label for="f-cat" class="text-xs font-bold text-gray-500">Categoría</label>
							<select id="f-cat" bind:value={form.categoria} class="w-full p-2 border rounded bg-white">
								<option value="">Elegir...</option>
								{#each categorias as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="f-punit" class="text-xs font-bold text-gray-500">P. Unidad</label>
							<input id="f-punit" type="number" step="0.01" bind:value={form.precioUnidad} class="w-full p-2 border rounded">
						</div>
						<div>
							<label for="f-pmayor" class="text-xs font-bold text-gray-500">P. Mayor</label>
							<input id="f-pmayor" type="number" step="0.01" bind:value={form.preciopormayor} class="w-full p-2 border rounded">
						</div>
					</div>
					<div>
						<label for="f-moq" class="text-xs font-bold text-gray-500">Mínimo</label>
						<input id="f-moq" type="number" bind:value={form.moq} class="w-full p-2 border rounded">
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div
							class="border-2 border-dashed h-32 flex items-center justify-center relative cursor-pointer hover:bg-gray-50 rounded"
							on:click={()=>triggerFile('f1')}
							role="button"
							tabindex="0"
							on:keydown={(e)=> e.key === 'Enter' && triggerFile('f1')}
							aria-label="Subir foto 1"
						>
							{#if preview1}
								<img src={preview1} alt="Vista previa 1" class="h-full object-contain">
								<button
									type="button"
									class="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-bl text-xs"
									on:click|stopPropagation={()=>{file1=null;preview1="";form.imagen=""}}
									aria-label="Eliminar foto 1"
								>✕</button>
							{:else}
								<span class="text-gray-400 text-xs">Foto 1</span>
							{/if}
							<input id="f1" type="file" hidden accept="image/*" on:change={(e)=>handleFile(e,1)}>
						</div>

						<div
							class="border-2 border-dashed h-32 flex items-center justify-center relative cursor-pointer hover:bg-gray-50 rounded"
							on:click={()=>triggerFile('f2')}
							role="button"
							tabindex="0"
							on:keydown={(e)=> e.key === 'Enter' && triggerFile('f2')}
							aria-label="Subir foto 2"
						>
							{#if preview2}
								<img src={preview2} alt="Vista previa 2" class="h-full object-contain">
								<button
									type="button"
									class="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-bl text-xs"
									on:click|stopPropagation={()=>{file2=null;preview2="";form.imagen2=""}}
									aria-label="Eliminar foto 2"
								>✕</button>
							{:else}
								<span class="text-gray-400 text-xs">Foto 2</span>
							{/if}
							<input id="f2" type="file" hidden accept="image/*" on:change={(e)=>handleFile(e,2)}>
						</div>
					</div>

					<button on:click={guardarProducto} disabled={loading} class="w-full bg-yellow-500 text-white font-bold py-3 rounded hover:bg-yellow-600 disabled:opacity-50">{loading?'Guardando...':(form.id?'Actualizar':'Crear')}</button>
					{#if form.id}<button on:click={resetForm} class="w-full bg-gray-200 py-2 rounded text-sm font-bold">Cancelar</button>{/if}
					{#if msg.text}<div class="p-2 text-center text-sm rounded font-bold {msg.type==='error'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}">{msg.text}</div>{/if}
				</div>
			</div>

			<div class="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border min-h-[500px]">
				<div class="flex justify-between items-center mb-4">
					<h2 class="font-bold text-xl">Inventario ({listaFiltrada.length})</h2>
					<label for="search-inv" class="sr-only">Buscar en inventario</label>
					<input id="search-inv" type="text" bind:value={searchTerm} placeholder="Buscar código o nombre..." class="border p-2 rounded w-64">
				</div>

				{#if loading && inventory.length === 0}
					<div class="text-center py-10 text-gray-400">Cargando...</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{#each listaFiltrada as item (item.$id)}
							<div class="border rounded-lg p-3 flex gap-3 relative {item.disponible ? '' : 'bg-gray-50 opacity-75'}">
								<div class="w-20 h-20 bg-white rounded shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
									{#if item.imagen}<img src={item.imagen} alt={item.descripcion} class="w-full h-full object-contain">{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="font-bold text-sm truncate">{item.descripcion}</div>
									<div class="text-xs text-gray-500">{item.codigo || 'S/N'}</div>
									<div class="text-orange-500 font-bold mt-1">Bs {item.preciopormayor}</div>
								</div>
								<div class="flex flex-col gap-1">
									<button
										on:click={()=>toggleStock(item)}
										aria-label={item.disponible ? "Desactivar stock" : "Activar stock"}
										class="w-8 h-8 flex items-center justify-center rounded transition-colors {item.disponible ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.5 1v7h1V1z"/><path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812"/></svg>
									</button>
									<button on:click={()=>editar(item)} aria-label="Editar producto" class="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100">✏️</button>
									<button on:click={()=>borrar(item.$id)} aria-label="Borrar producto" class="w-8 h-8 flex items-center justify-center rounded bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600">🗑️</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>