	<script>
		import { onMount } from 'svelte';
		import { Client, Databases, Storage, ID, Query } from 'appwrite';

		// --- 1. CONFIGURACIÓN ---
		const ADMIN_PASS = "eddy4242"; // Tu contraseña

		const PROJECT_ID = "692ee6b70012153cd33c";
		const DATABASE_ID = "692ee774002e9a3c8601";
		const COLLECTION_ID = "catalogo";
		const BUCKET_ID = "692ef19e001ffa75d062";

		// --- 2. VARIABLES ---
		let client, db, storage;
		let isLoggedIn = false;
		let passwordInput = "";
		let loginError = false;

		let inventory = [];
		let loading = false;
		let searchTerm = "";
		// Corrección 1: Inicializamos msg correctamente
		let msg = { text: "", type: "" };

		// Formulario
		let form = {
			id: null,
			descripcion: "",
			codigo: "",
			categoria: "",
			precioUnidad: 0,
			preciopormayor: 0,
			moq: 6,
			imagen: "",
			imagen2: "",
			disponible: true
		};

		const categorias = ["Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];
		let file1, file2;
		let preview1, preview2;

		onMount(() => {
			client = new Client().setEndpoint("https://fra.cloud.appwrite.io/v1").setProject(PROJECT_ID);
			db = new Databases(client);
			storage = new Storage(client);

			// Intentamos cargar productos al iniciar si ya estuviéramos logueados (opcional)
			// Pero como hay login, esperamos a que el usuario entre.
		});

		// --- 3. FUNCIONES ---

		function login() {
			if (passwordInput === ADMIN_PASS) {
				isLoggedIn = true;
				buscarProductos(); // Cargar productos al entrar
			} else {
				loginError = true;
				setTimeout(() => loginError = false, 2000);
			}
		}

		async function buscarProductos() {
			// Si está vacío, buscamos todo (sin filtro)
			loading = true;
			inventory = [];

			try {
				let queries = [Query.limit(50), Query.orderDesc('$createdAt')];

				// Solo agregamos búsqueda si hay texto
				if(searchTerm.trim()) {
					queries.push(Query.search('descripcion', searchTerm));
				}

				try {
					// Intento 1: Búsqueda directa con índices
					const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
					inventory = res.documents;
				} catch (e) {
					console.warn("Faltan índices en Appwrite, usando modo compatibilidad...", e);
					// Intento 2: Fallback (Carga todo y filtra en el navegador si fallan los índices)
					const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100), Query.orderDesc('$createdAt')]);
					if (searchTerm.trim()) {
						inventory = res.documents.filter(p =>
							p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
							(p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
						);
					} else {
						inventory = res.documents;
					}
				}

				if(inventory.length === 0 && searchTerm) mostrarMensaje("No se encontraron productos", "error");

			} catch (error) {
				console.error(error);
				// Ahora esta función ya no rompe el código
				mostrarMensaje("Error de conexión o permisos", "error");
			}
			loading = false;
		}

		function handleKeydown(e) { if (e.key === 'Enter') buscarProductos(); }

		async function guardarProducto() {
			loading = true;
			try {
				let url1 = form.imagen;
				let url2 = form.imagen2;

				// Subir fotos si se seleccionaron nuevas
				if (file1) url1 = await uploadPhoto(file1);
				if (file2) url2 = await uploadPhoto(file2);

				if (!url1) throw new Error("La Foto Principal es obligatoria");

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
					// ACTUALIZAR
					await db.updateDocument(DATABASE_ID, COLLECTION_ID, form.id, data);
					// Actualizamos la lista localmente para que se vea rápido
					const idx = inventory.findIndex(p => p.$id === form.id);
					if (idx > -1) inventory[idx] = { ...inventory[idx], ...data };
					mostrarMensaje("Producto actualizado", "success");
				} else {
					// CREAR
					const newDoc = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
					inventory = [newDoc, ...inventory];
					mostrarMensaje("Producto creado", "success");
				}
				resetForm();
			} catch (error) {
				console.error(error);
				mostrarMensaje(error.message || "Error al guardar", "error");
			}
			loading = false;
		}

		async function uploadPhoto(file) {
			try {
				const up = await storage.createFile(BUCKET_ID, ID.unique(), file);
				return `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${up.$id}/view?project=${PROJECT_ID}`;
			} catch (e) {
				throw new Error("Error subiendo foto: " + e.message);
			}
		}

		async function borrarProducto(id) {
			if (!confirm("¿Seguro que quieres borrar este producto?")) return;
			try {
				await db.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
				inventory = inventory.filter(p => p.$id !== id);
				mostrarMensaje("Producto eliminado", "success");
			} catch (e) { mostrarMensaje("Error al borrar (Revisa permisos)", "error"); }
		}

		async function toggleStock(product) {
			// Optimistic UI update (cambia visualmente primero)
			const oldState = product.disponible;
			const newState = !oldState;

			// Actualizamos localmente
			product.disponible = newState;
			inventory = [...inventory];

			try {
				await db.updateDocument(DATABASE_ID, COLLECTION_ID, product.$id, { disponible: newState });
			} catch (e) {
				// Si falla, revertimos
				product.disponible = oldState;
				inventory = [...inventory];
				mostrarMensaje("No tienes permiso para editar", "error");
			}
		}

		function editar(product) {
			form = { ...product, id: product.$id };
			preview1 = product.imagen;
			preview2 = product.imagen2;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		function resetForm() {
			form = { id: null, descripcion: "", codigo: "", categoria: "", precioUnidad: 0, preciopormayor: 0, moq: 6, imagen: "", imagen2: "", disponible: true };
			file1 = null; file2 = null; preview1 = ""; preview2 = "";
		}

		function handleFileSelect(e, num) {
			const file = e.target.files[0];
			if (file) {
				if (num === 1) { file1 = file; preview1 = URL.createObjectURL(file); }
				else { file2 = file; preview2 = URL.createObjectURL(file); }
			}
		}

		// --- CORRECCIÓN CLAVE AQUÍ ---
		function mostrarMensaje(texto, tipo) {
			// Antes decía: msg = { text: texto, type }; -> Error porque 'type' no existía
			msg = { text: texto, type: tipo };
			setTimeout(() => msg = { text: "", type: "" }, 3000);
		}
	</script>

	<div class="min-h-screen bg-gray-100 font-sans text-gray-800">

		{#if !isLoggedIn}
			<div class="fixed inset-0 bg-[#111] z-50 flex flex-col items-center justify-center p-4">
				<div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
					<div class="w-16 h-16 bg-orange-100 text-[#FF6600] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"><i class="bi bi-shield-lock-fill"></i></div>
					<h2 class="text-2xl font-bold mb-6 text-gray-800">Admin Ale Importadora</h2>
					<input type="password" bind:value={passwordInput} class="w-full bg-gray-50 border-2 border-gray-200 p-3 rounded-lg text-center text-lg mb-4 focus:border-[#FF6600] outline-none transition-colors" placeholder="Contraseña Maestra">
					<button on:click={login} class="w-full bg-[#FF6600] hover:bg-[#e05a00] text-white font-bold py-3 rounded-lg transition-transform active:scale-95">Entrar</button>
					{#if loginError}<p class="text-red-500 mt-4 text-sm font-bold animate-bounce">Contraseña incorrecta</p>{/if}
				</div>
			</div>
		{/if}

		{#if isLoggedIn}
			<div class="w-full max-w-[1900px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

				<div class="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4 h-fit">
					<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
						<h2 class="text-xl font-bold mb-4 flex items-center gap-2">{form.id ? '✏️ Editando...' : '✨ Nuevo Producto'}</h2>

						<div class="space-y-4">
							<div>
								<label class="text-xs font-bold text-gray-500 uppercase">Nombre</label>
								<input type="text" bind:value={form.descripcion} class="w-full p-2 border rounded focus:border-orange-500 outline-none" placeholder="Ej: Parlante...">
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div><label class="text-xs font-bold text-gray-500 uppercase">Código</label><input type="text" bind:value={form.codigo} class="w-full p-2 border rounded focus:border-orange-500 outline-none"></div>
								<div>
									<label class="text-xs font-bold text-gray-500 uppercase">Categoría</label>
									<select bind:value={form.categoria} class="w-full p-2 border rounded focus:border-orange-500 outline-none bg-white">
										<option value="" disabled>Elegir...</option>
										{#each categorias as cat} <option value={cat}>{cat}</option> {/each}
									</select>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div><label class="text-xs font-bold text-gray-500 uppercase">P. Unidad</label><input type="number" step="0.01" bind:value={form.precioUnidad} class="w-full p-2 border rounded focus:border-orange-500 outline-none"></div>
								<div><label class="text-xs font-bold text-gray-500 uppercase">P. Mayor</label><input type="number" step="0.01" bind:value={form.preciopormayor} class="w-full p-2 border rounded focus:border-orange-500 outline-none"></div>
							</div>
							<div><label class="text-xs font-bold text-gray-500 uppercase">Mínimo (MOQ)</label><input type="number" bind:value={form.moq} class="w-full p-2 border rounded focus:border-orange-500 outline-none"></div>

							<div class="grid grid-cols-2 gap-2">
								<div class="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center relative hover:bg-gray-50 cursor-pointer h-32 flex items-center justify-center overflow-hidden group">
									{#if preview1}
										<img src={preview1} class="w-full h-full object-contain" alt="">
										<button on:click|stopPropagation={() => {file1=null; preview1=""; form.imagen=""}} class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
									{:else}
										<div class="text-gray-400"><i class="bi bi-camera text-2xl"></i><p class="text-[10px]">Principal</p></div>
									{/if}
									<input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" on:change={(e) => handleFileSelect(e, 1)}>
								</div>
								<div class="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center relative hover:bg-gray-50 cursor-pointer h-32 flex items-center justify-center overflow-hidden group">
									{#if preview2}
										<img src={preview2} class="w-full h-full object-contain" alt="">
										<button on:click|stopPropagation={() => {file2=null; preview2=""; form.imagen2=""}} class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
									{:else}
										<div class="text-gray-400"><i class="bi bi-camera text-2xl"></i><p class="text-[10px]">Secundaria</p></div>
									{/if}
									<input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" on:change={(e) => handleFileSelect(e, 2)}>
								</div>
							</div>

							<button on:click={guardarProducto} disabled={loading} class="w-full py-3 rounded-lg font-bold text-white transition-all shadow-md {form.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FF6600] hover:bg-[#e05a00]'} {loading ? 'opacity-50 cursor-not-allowed' : ''}">
								{loading ? 'Procesando...' : (form.id ? 'Actualizar Producto' : 'Crear Producto')}
							</button>
							{#if form.id}<button on:click={resetForm} class="w-full py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold">Cancelar Edición</button>{/if}

							{#if msg.text}
								<div class="p-3 rounded text-center text-sm font-bold animate-in fade-in zoom-in {msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
									{msg.text}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="lg:col-span-8 xl:col-span-9">
					<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
						<div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
							<h2 class="text-xl font-bold">Inventario</h2>
							<div class="relative w-full md:w-96 flex gap-2">
								<div class="relative flex-1">
									<input type="text" bind:value={searchTerm} on:keydown={handleKeydown} placeholder="Busca 'reloj'..." class="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-transparent focus:bg-white focus:border-orange-500 rounded-lg text-sm outline-none transition-all">
									<i class="bi bi-search absolute left-3 top-3 text-gray-400"></i>
								</div>
								<button on:click={buscarProductos} class="bg-[#FF6600] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#e05a00] transition-colors shadow-sm">Buscar</button>
							</div>
						</div>

						{#if loading}
							<div class="text-center py-20 text-gray-400 flex flex-col items-center animate-pulse"><i class="bi bi-arrow-repeat text-4xl mb-2 animate-spin"></i><p>Cargando datos...</p></div>
						{:else if inventory.length === 0}
							<div class="text-center py-20 text-gray-400 flex flex-col items-center">
								<div class="bg-gray-50 p-6 rounded-full mb-4"><i class="bi bi-search text-4xl text-gray-300"></i></div>
								<p class="font-bold text-gray-500">
									{#if searchTerm}
										No se encontraron productos con ese nombre.
									{:else}
										Presiona buscar para ver productos recientes.
									{/if}
								</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
								{#each inventory as p (p.$id)}
									<div class="flex items-start gap-3 p-3 border rounded-xl hover:shadow-lg transition-all bg-white relative group {p.disponible ? '' : 'opacity-70 bg-gray-50 grayscale'}">
										<span class="absolute top-2 left-2 bg-white/90 text-[10px] font-bold px-1.5 rounded shadow-sm border border-gray-200 z-10 pointer-events-none">{p.codigo || 'S/N'}</span>

										<div class="relative w-28 h-28 flex-shrink-0 z-0 hover:z-50 transition-all duration-200">
											<div class="w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative shadow-sm group-hover/img:scale-[2.5] group-hover/img:shadow-2xl origin-top-left transition-transform duration-200 hover:scale-[2.5] hover:shadow-2xl cursor-zoom-in bg-white">
												{#if p.imagen}<img src={p.imagen} alt="" class="w-full h-full object-contain bg-white">{:else}<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="bi bi-image"></i></div>{/if}
												{#if !p.disponible}<div class="absolute inset-0 bg-black/10 flex items-center justify-center"><span class="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Agotado</span></div>{/if}
											</div>
										</div>

										<div class="flex-1 min-w-0 py-1">
											<h3 class="font-bold text-sm text-gray-800 leading-tight mb-1 line-clamp-2" title={p.descripcion}>{p.descripcion}</h3>
											<p class="text-xs text-gray-500 mb-2">{p.categoria}</p>
											<div class="flex flex-col gap-0.5">
												<div class="flex items-center justify-between"><span class="text-[10px] text-gray-400 uppercase font-bold">Mayor:</span><span class="text-sm font-black text-[#FF6600]">Bs. {p.preciopormayor}</span></div>
												<div class="flex items-center justify-between border-t border-dashed border-gray-200 pt-1 mt-1"><span class="text-[10px] text-gray-400 uppercase font-bold">Unidad:</span><span class="text-xs font-bold text-gray-600">Bs. {p.precioUnidad}</span></div>
											</div>
										</div>
										<div class="flex flex-col gap-1.5">
											<button on:click={() => editar(p)} class="w-8 h-8 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"><i class="bi bi-pencil-fill text-xs"></i></button>
											<button on:click={() => toggleStock(p)} class="w-8 h-8 rounded {p.disponible ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'} flex items-center justify-center transition-colors shadow-sm"><i class="bi {p.disponible ? 'bi-power' : 'bi-power'} text-xs font-bold"></i></button>
											<button on:click={() => borrarProducto(p.$id)} class="w-8 h-8 rounded bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><i class="bi bi-trash-fill text-xs"></i></button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>