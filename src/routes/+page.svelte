<script lang="ts">
	import { onMount } from 'svelte';
	// Importamos los componentes de tarjeta
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

	// --- LISTA DE CATEGORÍAS ---
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

	// Ofertas Variadas (Retail - Aleatorio)
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

	// --- LÓGICA DE FILTRADO ---
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
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></svg>
				</button>
			{/if}
			<div class="flex-1 relative">
				<div class="flex items-center bg-white rounded-[6px] border-2 border-[#FF6600] overflow-hidden transition-all shadow-sm hover:shadow-md h-[42px]">
					<input type="text" bind:value={searchTerm} placeholder="Buscar productos, marcas, códigos..." class="w-full bg-transparent outline-none px-4 text-gray-800 text-sm font-medium h-full" />
					{#if searchTerm}
						<button type="button" on:click={() => searchTerm = ''} class="text-gray-400 hover:text-[#FF6600] px-3">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
						</button>
					{/if}
					<div class="bg-[#FF6600] h-full px-5 flex items-center justify-center cursor-pointer hover:bg-[#e05a00] border-l border-[#e05a00]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
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
							VER LIQUIDACIÓN AHORA
						</div>
					</div>
				</a>

				<div class="bg-white p-4 rounded-[8px] shadow-sm border border-gray-200 relative group">
					<div class="flex justify-between items-center mb-4 px-1 border-b border-gray-100 pb-2">
						<h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FF6600" viewBox="0 0 16 16"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h-7a.5.5 0 0 1-.5-.5V9.5a.5.5 0 0 0-.5-.5H8a.5.5 0 0 0-.5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/></svg>
							Ofertas en Tienda
						</h2>
						<a href="/ofertas" class="text-[11px] font-bold text-[#FF6600] hover:underline">Ver todo ></a>
					</div>
					<button type="button" class="absolute left-0 top-1/2 z-20 bg-white/90 shadow-md border border-gray-100 rounded-r-[4px] w-8 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 hover:bg-white" on:click={() => scrollRetail(-300)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg>
					</button>
					<div bind:this={retailScrollContainer} class="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x">
						{#each ofertasVariadas as prod}
							<div class="min-w-[160px] md:min-w-[200px] snap-start"><RetailCard product={prod} /></div>
						{/each}
					</div>
					<button type="button" class="absolute right-0 top-1/2 z-20 bg-white/90 shadow-md border border-gray-100 rounded-l-[4px] w-8 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 hover:bg-white" on:click={() => scrollRetail(300)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg>
					</button>
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
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg> Borrar filtro
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
						<div class="inline-block bg-white p-4 rounded-full shadow-sm mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ccc" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
						</div>
						<p class="text-gray-500 font-medium text-sm">No encontramos productos con ese nombre.</p>
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
			<button on:click={scrollToTop} class="bg-white text-[#FF6600] p-3 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
			</button>
		{/if}

		<a href="https://wa.me/59161333335?text=Hola,%20vi%20su%20página%20web%20y%20quiero%20hacer%20un%20pedido" target="_blank" class="bg-[#25D366] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform animate-bounce-slow flex items-center justify-center">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
				<path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
			</svg>
		</a>

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