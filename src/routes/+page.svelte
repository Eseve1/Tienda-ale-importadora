<script lang="ts">
	import { onMount } from 'svelte';
	import RetailCard from '$lib/components/grid/RetailCard.svelte';
	import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';

	export let data;
	$: productosBase = data?.allProducts || [];

	// --- VARIABLES ---
	let searchTerm = "";
	let catActual = "Todo";
	let showBackToTop = false;

	// Referencias Scroll
	let retailScrollContainer;

	// --- TU LISTA OFICIAL DE CATEGORÍAS (FIJA) ---
	const categorias = [
		"Todo",
		"Belleza y salud",
		"Herramientas",
		"Hogar y cocina",
		"Infantil",
		"Moda y equipaje",
		"Oficina y escolar",
		"Tecnología"
	];

	// Ofertas Variadas (Retail)
	let ofertasVariadas = [];
	onMount(() => {
		if (productosBase.length > 0) {
			ofertasVariadas = productosBase
				.filter(p => parseFloat(p.precioUnidad || '0') > 0)
				.sort(() => 0.5 - Math.random())
				.slice(0, 15);
		}
	});

	function normalizar(texto) {
		return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
	}

	// Filtro de Productos
	$: mayoristasFiltrados = productosBase.filter(p => {
		const busqueda = normalizar(searchTerm);
		const nombreP = normalizar(p.descripcion || p.name);
		const codigoP = normalizar(p.codigo);

		const matchSearch = nombreP.includes(busqueda) || codigoP.includes(busqueda);

		let matchCat = false;
		if (catActual === "Todo") {
			matchCat = true;
		} else {
			const catP = normalizar(p.categoria || p.category);
			const catFiltro = normalizar(catActual);

			// Lógica Inteligente:
			// Si el producto es "Belleza" y el filtro es "Belleza y salud", COINCIDEN.
			// Si el producto es "Hogar" y el filtro es "Hogar y cocina", COINCIDEN.
			matchCat = catP.includes(catFiltro) || catFiltro.includes(catP);
		}
		return matchSearch && matchCat;
	});

	// Scroll Functions
	function scrollRetail(offset) {
		if (retailScrollContainer) retailScrollContainer.scrollBy({ left: offset, behavior: 'smooth' });
	}
	function handleScroll() { showBackToTop = window.scrollY > 300; }
	function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-[#f2f3f7] font-sans flex flex-col relative">

	<div class="bg-[#FF6600] text-white py-2 overflow-hidden relative z-[110]">
		<div class="whitespace-nowrap animate-marquee flex gap-10 font-bold text-xs md:text-sm tracking-widest uppercase opacity-90">
			<span>🔥 Envíos a todo Bolivia</span>
			<span>★ Precios de Fábrica</span>
			<span>📦 Proveedor Mayorista Confiable</span>
		</div>
	</div>

	<header class="sticky top-0 z-[100] bg-white border-b border-gray-200 px-4 py-3 shadow-md">
		<div class="max-w-[1400px] mx-auto flex items-center gap-3">
			{#if searchTerm}
				<button class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-full flex-shrink-0" on:click={() => searchTerm = ''}>
					<i class="bi bi-arrow-counterclockwise text-lg"></i>
				</button>
			{/if}
			<div class="flex-1 relative">
				<div class="flex items-center bg-white rounded-[6px] border-2 border-[#FF6600] overflow-hidden transition-all shadow-sm hover:shadow-md h-[42px]">
					<input type="text" bind:value={searchTerm} placeholder="Buscar productos, marcas, códigos..." class="w-full bg-transparent outline-none px-4 text-gray-800 text-sm font-medium h-full" />
					{#if searchTerm}<button type="button" on:click={() => searchTerm = ''} class="text-gray-400 hover:text-[#FF6600] px-3"><i class="bi bi-x-circle-fill"></i></button>{/if}
					<div class="bg-[#FF6600] h-full px-5 flex items-center justify-center cursor-pointer hover:bg-[#e05a00] border-l border-[#e05a00]">
						<i class="bi bi-search text-white text-lg font-bold"></i>
					</div>
				</div>
			</div>
		</div>
	</header>

	<div class="max-w-[1400px] mx-auto p-4 md:p-6 flex-1 w-full space-y-8">

		{#if !searchTerm && catActual === 'Todo'}
			<section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
				<a href="/ofertas" class="block mb-6 no-underline group transform transition-transform hover:scale-[1.002]">
					<div class="bg-gradient-to-r from-[#FF6600] to-[#ff8533] p-6 rounded-[8px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-orange-300">
						<div class="text-center md:text-left text-white">
							<div class="flex items-center justify-center md:justify-start gap-2 mb-1">
								<span class="text-[10px] font-black bg-white text-[#FF6600] px-2 py-0.5 rounded uppercase tracking-widest">Liquidación</span>
							</div>
							<h1 class="text-2xl md:text-4xl font-[900] uppercase tracking-tighter leading-none text-white drop-shadow-sm">Venta por Unidad</h1>
						</div>
						<div class="bg-white text-[#FF6600] px-6 py-2.5 rounded-[4px] font-bold text-xs uppercase shadow hover:bg-orange-50 transition-colors">
							Ver ofertas retail
						</div>
					</div>
				</a>
				<div class="bg-white p-4 rounded-[8px] shadow-sm border border-gray-200 relative group">
					<div class="flex justify-between items-center mb-4 px-1 border-b border-gray-100 pb-2">
						<h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="bi bi-shop text-[#FF6600]"></i> Ofertas en Tienda</h2>
						<a href="/ofertas" class="text-[11px] font-bold text-[#FF6600] hover:underline">Ver todo ></a>
					</div>
					<button type="button" class="absolute left-0 top-1/2 z-20 bg-white/90 shadow-md border border-gray-100 rounded-r-[4px] w-8 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 hover:bg-white" on:click={() => scrollRetail(-300)}><i class="bi bi-chevron-left"></i></button>
					<div bind:this={retailScrollContainer} class="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x">
						{#each ofertasVariadas as prod}
							<div class="min-w-[160px] md:min-w-[200px] snap-start"><RetailCard product={prod} /></div>
						{/each}
					</div>
					<button type="button" class="absolute right-0 top-1/2 z-20 bg-white/90 shadow-md border border-gray-100 rounded-l-[4px] w-8 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 hover:bg-white" on:click={() => scrollRetail(300)}><i class="bi bi-chevron-right"></i></button>
				</div>
			</section>
		{/if}

		<section>
			<div class="mb-6 sticky top-[70px] z-40 bg-[#f2f3f7] pt-2 pb-2 backdrop-blur-sm bg-opacity-95">
				<div class="flex justify-between items-end mb-3 px-1">
					<h2 class="text-xl md:text-2xl font-bold text-[#333] border-l-[6px] border-[#FF6600] pl-3 leading-none flex flex-col">
						<span class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Proveedores Verificados</span>
						Catálogo Mayorista
					</h2>
					{#if catActual !== 'Todo'}
						<button type="button" class="text-[11px] font-bold text-[#FF6600] hover:underline flex items-center gap-1" on:click={() => catActual = 'Todo'}>
							<i class="bi bi-x-lg"></i> Borrar filtro
						</button>
					{/if}
				</div>

				<div class="flex flex-wrap gap-2 px-1">
					{#each categorias as cat}
						<button
							type="button"
							class="px-4 py-2 rounded-full font-medium text-[12px] transition-all border shadow-sm
							{catActual === cat
								? 'bg-[#FF6600] text-white border-[#FF6600] ring-2 ring-offset-1 ring-[#FF6600]'
								: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-[#FF6600] hover:border-[#FF6600] active:scale-95'}"
							on:click={() => catActual = cat}
						>
							{cat}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-20">
				{#each mayoristasFiltrados as product}
					<WholesaleCard {product} />
				{:else}
					<div class="col-span-full py-20 text-center">
						<div class="inline-block bg-white p-4 rounded-full shadow-sm mb-4"><i class="bi bi-search text-3xl text-gray-300"></i></div>
						<p class="text-gray-500 font-medium text-sm">No encontramos productos en esta categoría.</p>
						<button type="button" class="mt-4 text-[#FF6600] text-xs font-bold uppercase tracking-widest border-b-2 border-[#FF6600]" on:click={() => {catActual='Todo'; searchTerm='';}}>Ver todo el catálogo</button>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<footer class="bg-white border-t border-gray-200 py-10 mt-auto">
		<div class="max-w-[1400px] mx-auto px-4 text-center">
			<h4 class="font-black text-[#333] uppercase tracking-tighter text-lg mb-2">Ale Importadora</h4>
			<p class="text-xs text-gray-500 font-medium mb-6">Importación directa y distribución mayorista en Bolivia.</p>
			<div class="flex justify-center gap-6 mb-8 text-sm text-gray-600">
				<a href="/" class="text-[#FF6600] font-bold">Inicio</a>
				<a href="/ofertas" class="hover:text-[#FF6600]">Liquidación</a>
				<a href="https://wa.me/59161333335" class="hover:text-[#FF6600]">Contacto Mayorista</a>
			</div>
			<div class="w-10 h-1 bg-[#FF6600] mx-auto rounded-full mb-6"></div>
			<p class="text-[10px] text-gray-400 uppercase tracking-widest">© 2025 AleImport. Todos los derechos reservados.</p>
			<p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Desarrollado con ❤️ por <a href="https://wa.me/59160819430" target="_blank" class="text-[#FF6600] hover:underline decoration-2">Eddy Severiche</a></p>
		</div>
	</footer>

	<div class="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 items-end">
		{#if showBackToTop}
			<button on:click={scrollToTop} class="bg-white text-[#FF6600] p-3 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform animate-in fade-in slide-in-from-bottom-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
			</button>
		{/if}
		<a href="https://wa.me/59161333335" target="_blank" class="bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform animate-bounce-slow flex items-center justify-center"><i class="bi bi-whatsapp text-2xl"></i></a>
	</div>
</div>

<style>
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-marquee { display: inline-flex; animation: marquee 20s linear infinite; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
</style>