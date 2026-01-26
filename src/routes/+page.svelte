<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Databases, Query } from 'appwrite';
	import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';
	import CartSheet from '$lib/components/cart/CartSheet.svelte';
	import { cart } from '$lib/stores/cart.svelte';

	const PROJECT_ID = "692ee6b70012153cd33c";
	const DATABASE_ID = "692ee774002e9a3c8601";
	const COLLECTION_ID = "catalogo";

	let productos: any[] = [];
	let loading = false;
	let hasMore = true;
	let lastId: string | null = null;

	// MODAL Y FOTOS
	let selectedProduct: any = null;
	let activeModalImage = "";

	let searchTerm = "";
	let catActual = "Todo";
	let showBackToTop = false;
	let debounceTimer: any;

	const categorias = ["Todo", "Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	const client = new Client().setEndpoint("https://cloud.appwrite.io/v1").setProject(PROJECT_ID);
	const db = new Databases(client);

	async function cargarProductos(reset = false) {
		if (loading) return;
		loading = true;

		if (reset) {
			productos = [];
			lastId = null;
			hasMore = true;
		}

		try {
			let queries = [
				Query.equal("disponible", true),
				Query.limit(20),
				Query.orderDesc('$createdAt')
			];

			if (catActual !== "Todo") queries.push(Query.equal("categoria", catActual));
			if (searchTerm.trim()) queries.push(Query.search("descripcion", searchTerm));
			if (lastId) queries.push(Query.cursorAfter(lastId));

			const res = await db.listDocuments(DATABASE_ID, COLLECTION_ID, queries);

			// Si trae menos de 20, ya no hay más
			if (res.documents.length < 20) hasMore = false;

			if (res.documents.length > 0) {
				lastId = res.documents[res.documents.length - 1].$id;
				productos = reset ? res.documents : [...productos, ...res.documents];
			} else if (reset) {
				hasMore = false;
			}

		} catch (error) {
			console.error("Error:", error);
		} finally {
			loading = false;
		}
	}

	function abrirModal(p: any) {
		selectedProduct = p;
		activeModalImage = p.imagen; // Resetear foto al abrir
		document.body.style.overflow = 'hidden';
	}

	function cerrarModal() {
		selectedProduct = null;
		document.body.style.overflow = '';
	}

	function addFromModal() {
		if(selectedProduct) {
			cart.add(selectedProduct, {}, selectedProduct.moq || 3);
			cart.openCart();
			cerrarModal();
		}
	}

	onMount(() => { cargarProductos(true); });

	function seleccionarCategoria(cat: string) {
		catActual = cat;
		searchTerm = "";
		cargarProductos(true);
	}

	function handleScroll() {
		showBackToTop = window.scrollY > 300;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Ale Importadora Bolivia | Catálogo Mayorista y Precios de Fábrica</title>
	<meta name="description" content="🔴 ¿Buscas proveedores? Importación directa de novedades en Bolivia. Precios de fábrica en Hogar, Belleza, Tecnología y más. Envíos garantizados a los 9 departamentos. ¡Cotiza aquí!" />
	<meta name="theme-color" content="#FF6600" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="index, follow" />

	<meta property="og:site_name" content="Ale Importadora Bolivia" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://importadoraale.app/" />
	<meta property="og:title" content="🔥 Catálogo Mayorista 2026 - Ale Importadora" />
	<meta property="og:description" content="Ver catálogo completo con precios de fábrica. Envíos a todo Bolivia. Haz clic para ver novedades." />
	<meta property="og:image" content="https://cloud.appwrite.io/v1/storage/buckets/692ee6e00021e93c8601/files/6794637d003885021118/view?project=692ee6b70012153cd33c" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
</svelte:head>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">

	<div class="bg-gray-900 text-white py-1.5 overflow-hidden relative z-50">
		<div class="whitespace-nowrap animate-marquee flex gap-10 text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90 items-center">
			<span>🇧🇴 Envíos a todo Bolivia</span> <span>★ Precios de Fábrica</span> <span>📦 Venta por Cajas</span>
			<span>🔥 Ofertas Semanales</span> <span>⚡ Despacho Inmediato</span>
			<span>🇧🇴 Envíos a todo Bolivia</span> <span>★ Precios de Fábrica</span> <span>📦 Venta por Cajas</span>
		</div>
	</div>

	<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm px-4 py-3">
		<div class="max-w-[1400px] mx-auto relative group">
			<input type="text" bind:value={searchTerm} on:input={() => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => cargarProductos(true), 800); }} placeholder="¿Qué estás buscando hoy?" class="w-full bg-gray-100 px-5 py-3 pl-12 rounded-xl outline-none focus:ring-1 focus:ring-[#FF6600] transition-all text-sm"/>
			<div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
		</div>
	</header>

	<div class="max-w-[1400px] mx-auto p-4 w-full flex-1 space-y-6">

		<div class="relative rounded-2xl overflow-hidden shadow-lg mt-2 min-h-[180px] md:min-h-[240px] flex items-center">
			<div class="absolute inset-0 bg-gradient-to-r from-[#FF6600] to-[#4a1900]"></div>
			<div class="relative z-10 px-6 md:px-12 text-white w-full">
				<span class="inline-block border border-white/30 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">Mayorista Oficial</span>
				<h1 class="text-3xl md:text-5xl font-[900] italic uppercase leading-none mb-2 tracking-tight">ALE IMPORTADORA <br> BOLIVIA</h1>
				<p class="text-white/80 text-sm font-medium max-w-lg">Importación directa. Precios especiales para tiendas y revendedores.</p>
			</div>
		</div>

		<div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar mt-6">
			{#each categorias as cat}
				<button class="whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold border transition-all {catActual === cat ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}" on:click={() => seleccionarCategoria(cat)}>{cat}</button>
			{/each}
		</div>

		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
			{#each productos as product (product.$id)}
				<div class="h-full cursor-pointer" on:click={() => abrirModal(product)}>
					<WholesaleCard {product} />
				</div>
			{/each}
		</div>

		<div class="py-8 flex justify-center w-full">
			{#if loading}
				<div class="flex flex-col items-center gap-2 animate-pulse">
					<div class="w-6 h-6 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin"></div>
					<span class="text-[10px] font-bold text-[#FF6600] uppercase">Cargando...</span>
				</div>
			{:else if hasMore && productos.length > 0}
				<button
					on:click={() => cargarProductos(false)}
					class="bg-white text-[#FF6600] border-2 border-[#FF6600] px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#FF6600] hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 group"
				>
					<span>Ver siguientes productos</span>
					<span class="group-hover:translate-y-1 transition-transform">⬇</span>
				</button>
			{:else if !loading && productos.length === 0}
				<div class="text-center text-gray-400 py-10">No se encontraron productos en esta categoría.</div>
			{/if}
		</div>

	</div>

	{#if selectedProduct}
		<div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" on:click={cerrarModal}>
			<div class="bg-white w-full max-w-3xl rounded-2xl overflow-hidden relative flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] md:h-auto overflow-y-auto md:overflow-visible" on:click|stopPropagation>

				<button class="absolute top-3 right-3 z-30 bg-gray-100 hover:bg-red-100 rounded-full p-2 transition-colors shadow-sm" on:click={cerrarModal}>✕</button>

				<div class="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100 relative">
					<div class="w-full h-[180px] sm:h-[220px] md:h-[350px] flex items-center justify-center mb-4 mt-6 md:mt-0">
						<img src={activeModalImage || selectedProduct.imagen} alt="" class="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300" />
					</div>

					{#if selectedProduct.imagen2}
						<div class="flex gap-3 mb-2 md:mb-0">
							<button on:click={() => activeModalImage = selectedProduct.imagen} class="w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg overflow-hidden transition-all {activeModalImage === selectedProduct.imagen ? 'border-[#FF6600]' : 'border-gray-200 opacity-60 hover:opacity-100'}">
								<img src={selectedProduct.imagen} alt="" class="w-full h-full object-cover"/>
							</button>
							<button on:click={() => activeModalImage = selectedProduct.imagen2} class="w-12 h-12 md:w-14 md:h-14 border-2 rounded-lg overflow-hidden transition-all {activeModalImage === selectedProduct.imagen2 ? 'border-[#FF6600]' : 'border-gray-200 opacity-60 hover:opacity-100'}">
								<img src={selectedProduct.imagen2} alt="" class="w-full h-full object-cover"/>
							</button>
						</div>
					{/if}
				</div>

				<div class="w-full md:w-1/2 p-5 md:p-8 flex flex-col">
					<span class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{selectedProduct.categoria || 'Producto'}</span>
					<h2 class="text-lg md:text-2xl font-black text-gray-800 leading-tight mb-4">{selectedProduct.descripcion}</h2>

					<div class="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5">
						<div class="text-xs text-orange-600 font-bold uppercase mb-1">Precio Mayorista</div>
						<div class="text-3xl md:text-4xl font-black text-[#FF6600]">Bs. {selectedProduct.preciopormayor}</div>
					</div>

					<div class="space-y-3 text-sm text-gray-600 mb-6 flex-1">
						<div class="flex justify-between border-b border-gray-100 pb-2">
							<span>Código Ref:</span>
							<span class="font-mono font-bold text-gray-800">{selectedProduct.codigo || 'S/N'}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 pb-2">
							<span>Cantidad Mínima:</span>
							<span class="font-bold text-[#FF6600]">({selectedProduct.moq || 3} unidades)</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 pb-2">
							<span>Inversión Total:</span>
							<span class="font-bold text-gray-900">Bs. {((selectedProduct.preciopormayor || 0) * (selectedProduct.moq || 3)).toFixed(2)}</span>
						</div>
					</div>

					<button on:click={addFromModal} class="mt-auto w-full bg-[#FF6600] text-white py-3.5 md:py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-orange-200 hover:bg-[#e55b00] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm md:text-base">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
						Añadir al Pedido
					</button>
				</div>
			</div>
		</div>
	{/if}

	<footer class="bg-white py-12 border-t border-gray-100 mt-auto">
		<div class="max-w-4xl mx-auto text-center px-4">
			<h2 class="text-xl font-black text-gray-800 uppercase tracking-tight mb-2">ALE IMPORTADORA</h2>
			<div class="w-12 h-1 bg-[#FF6600] mx-auto rounded-full mb-6"></div>
			<p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-1">© 2025 AleImport. Todos los derechos reservados.</p>
			<p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
				Desarrollado con <span class="text-red-500">❤</span> por <a href="https://wa.me/59160819430" target="_blank" class="text-[#FF6600] hover:underline decoration-2">Eddy Severiche</a>
			</p>
		</div>
	</footer>

	<div class="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-center gap-4">
		{#if showBackToTop}
			<button
				on:click={scrollToTop}
				aria-label="Volver arriba"
				class="pointer-events-auto h-12 w-12 rounded-full bg-gray-900/90 backdrop-blur text-white shadow-lg flex items-center justify-center hover:bg-[#FF6600] hover:-translate-y-1 transition-all duration-300 animate-in slide-in-from-bottom-5"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
			</button>
		{/if}

		<div class="pointer-events-auto">
			<CartSheet />
		</div>
	</div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-marquee { display: inline-flex; animation: marquee 30s linear infinite; }
</style>