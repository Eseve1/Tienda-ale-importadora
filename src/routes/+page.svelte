<script lang="ts">
	import { onMount } from 'svelte';
	import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';

	export let data;
	$: productosBase = data?.allProducts || [];

	// --- VARIABLES ---
	let searchTerm = "";
	let catActual = "Todo";
	let showBackToTop = false;
	let selectedProduct = null;

	// --- CATEGORÍAS ---
	const categorias = [
		"Todo", "Belleza y salud", "Herramientas", "Hogar y cocina",
		"Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"
	];

	// --- FILTRO ---
	function normalizar(texto) {
		return (texto || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
	}

	$: mayoristasFiltrados = productosBase.filter(p => {
		const nombre = normalizar(p.descripcion || p.name);
		const codigo = normalizar(p.codigo);
		const catProd = normalizar(p.categoria || p.category);

		const busqueda = normalizar(searchTerm);
		const catFiltro = normalizar(catActual);

		const matchTexto = !searchTerm || nombre.includes(busqueda) || codigo.includes(busqueda);
		const matchCat = catActual === "Todo" || catProd.includes(catFiltro) || catFiltro.includes(catProd);

		return matchTexto && matchCat;
	});

	// --- ACCIONES ---
	function seleccionarCategoria(cat) {
		catActual = cat;
		searchTerm = "";
	}

	function alEscribir() {
		if (catActual !== 'Todo') catActual = 'Todo';
	}

	// --- MODAL Y SCROLL ---
	function abrirModal(p) { selectedProduct = p; history.pushState({ modalOpen: true }, "", ""); document.body.style.overflow = 'hidden'; }
	function cerrarModal() { selectedProduct = null; document.body.style.overflow = ''; if (history.state?.modalOpen) history.back(); }
	function handleScroll() { showBackToTop = window.scrollY > 300; }
	function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

	onMount(() => {
		window.onpopstate = () => { if (selectedProduct) { selectedProduct = null; document.body.style.overflow = ''; } };
	});
</script>

<svelte:head>
	<title>Ale Importadora Bolivia | Mayorista y Precios de Fábrica</title>

	<meta name="description" content="La plataforma mayorista más confiable de Bolivia. Importación directa, venta por cajas y envíos a todo el país. Abastece tu negocio hoy." />

	<meta name="keywords" content="mayorista bolivia, ale importadora, precios de fabrica, santa cruz, revendedores, importacion directa" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Ale Importadora Bolivia - Catálogo Mayorista" />
	<meta property="og:description" content="Mira nuestro catálogo con precios de fábrica. Envíos garantizados a todo el país." />
	<meta property="og:url" content="https://aleimportadora.bo/" />
	<meta property="og:image" content="%sveltekit.assets%/favicon.png" />

	<meta name="theme-color" content="#FF6600" />
</svelte:head>
<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-[#f4f5f7] font-sans flex flex-col relative">

	<div class="bg-gray-800 text-white py-1.5 overflow-hidden relative z-[110]">
		<div class="whitespace-nowrap animate-marquee flex gap-10 font-bold text-[10px] md:text-xs tracking-widest uppercase opacity-90">
			<span>🇧🇴 Envíos a todo Bolivia</span><span>★ Precios de Fábrica</span><span>📦 Venta por Cajas y Docenas</span>
		</div>
	</div>

	<header class="sticky top-0 z-[100] bg-white border-b border-gray-200 px-4 py-3 shadow-md h-[70px] flex items-center">
		<div class="max-w-[1400px] mx-auto flex items-center gap-3 w-full">
			{#if searchTerm}
				<button class="bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 transition-colors" on:click={() => searchTerm = ''}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>
				</button>
			{/if}
			<div class="flex-1 flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:border-[#FF6600] focus-within:ring-1 focus-within:ring-[#FF6600] h-[42px] overflow-hidden transition-all">
				<input
					type="text"
					bind:value={searchTerm}
					on:input={alEscribir}
					placeholder="Buscar productos..."
					class="w-full px-4 text-sm font-medium outline-none h-full bg-transparent text-gray-800"
				/>
				{#if searchTerm}<button on:click={() => searchTerm = ''} class="px-3 text-gray-400 hover:text-red-500">✕</button>{/if}
				<div class="bg-white h-full px-4 flex items-center justify-center text-[#FF6600] border-l border-gray-200">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
				</div>
			</div>
		</div>
	</header>

	<div class="max-w-[1400px] mx-auto p-2 md:p-6 flex-1 w-full space-y-4">

		<div class="relative rounded-xl overflow-hidden shadow-md mt-2 group cursor-default">
			<div class="absolute inset-0 bg-gradient-to-r from-[#FF6600] to-[#2d2d2d]"></div>

			<svg class="absolute right-0 top-0 h-full w-1/2 opacity-10 text-white transform translate-x-10" fill="currentColor" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/></svg>

			<div class="relative z-10 px-6 py-8 md:px-10 md:py-10 text-white flex flex-col justify-center items-start h-full">
            <span class="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                Mayorista Oficial
            </span>
				<h1 class="text-2xl md:text-5xl font-[900] uppercase italic tracking-tighter leading-none mb-2 drop-shadow-sm">
					ALE IMPORTADORA <br class="md:hidden">BOLIVIA
				</h1>
				<p class="text-white/80 text-xs md:text-sm font-medium max-w-lg mb-4">
					Importación directa. Precios especiales para tiendas y revendedores.
				</p>
			</div>
		</div>

		<section>
			<div class="sticky top-[69px] z-50 bg-[#f4f5f7]/95 backdrop-blur-sm py-3 -mx-2 px-2 md:mx-0 shadow-sm transition-all border-b border-gray-200/50">
				<div class="flex justify-between items-center mb-2 px-1">
					<h2 class="text-lg md:text-2xl font-bold text-[#333] border-l-[4px] border-[#FF6600] pl-3 leading-none flex flex-col">
						<span class="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Catálogo</span>
						Mayorista
					</h2>
					{#if catActual !== 'Todo'}
						<button class="text-[10px] bg-white border border-red-200 text-red-500 px-3 py-1 rounded-full font-bold hover:bg-red-50 transition-colors flex items-center gap-1 shadow-sm" on:click={() => seleccionarCategoria('Todo')}>
							Borrar filtro <span class="text-xs">✕</span>
						</button>
					{/if}
				</div>

				<div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
					{#each categorias as cat}
						<button
							class="whitespace-nowrap px-4 py-2 rounded-lg font-bold text-[11px] border transition-all shadow-sm active:scale-95
              {catActual === cat
               ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-md'
               : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6600] hover:text-[#FF6600]'}"
							on:click={() => seleccionarCategoria(cat)}>
							{cat}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 pb-20 mt-4">
				{#each mayoristasFiltrados as product}
					<div on:click={() => abrirModal(product)} class="cursor-pointer h-full">
						<WholesaleCard {product} />
					</div>
				{:else}
					<div class="col-span-full py-20 text-center flex flex-col items-center">
						<div class="bg-white p-4 rounded-full shadow-sm mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ccc" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg></div>
						<p class="text-gray-500 font-medium text-sm">No encontramos productos.</p>
						<button class="mt-4 text-[#FF6600] text-xs font-bold uppercase border-b border-[#FF6600]" on:click={() => {catActual='Todo'; searchTerm='';}}>Ver todo</button>
					</div>
				{/each}
			</div>
		</section>

	</div>

	<footer class="bg-white border-t border-gray-200 py-10 mt-auto text-center">
		<div class="max-w-[1400px] mx-auto px-4">
			<h4 class="font-black text-[#333] uppercase text-lg mb-2">Ale Importadora</h4>
			<div class="w-10 h-1 bg-[#FF6600] mx-auto rounded-full mb-6"></div>
			<p class="text-[10px] text-gray-400 uppercase tracking-widest">© 2025 AleImport. Todos los derechos reservados.</p>
			<p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
				Desarrollado con ❤️ por <a href="https://wa.me/59160819430" target="_blank" class="text-[#FF6600] hover:underline decoration-2">Eddy Severiche</a>
			</p>
		</div>
	</footer>

	<div class="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 items-end pointer-events-none">

		{#if showBackToTop}
			<button on:click={scrollToTop} class="pointer-events-auto bg-white text-[#FF6600] w-12 h-12 rounded-full shadow-lg border border-gray-200 flex items-center justify-center animate-in fade-in zoom-in hover:scale-110 transition-transform">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5"/></svg>
			</button>
		{/if}

		<a href="https://wa.me/59161333335?text=Hola,%20vi%20su%20página%20y%20quiero%20hacer%20un%20pedido" target="_blank" class="pointer-events-auto bg-[#25D366] text-white w-12 h-12 rounded-full shadow-xl hover:scale-110 transition-transform animate-bounce-slow flex items-center justify-center ring-2 ring-white">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
				<path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
			</svg>
		</a>
	</div>
</div>

{#if selectedProduct}
	<div class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
		<div class="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" on:click={cerrarModal}></div>
		<div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
			<button on:click={cerrarModal} class="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-sm transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

			<div class="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-10 relative">
				{#if selectedProduct.imagen}
					<img src={selectedProduct.imagen} alt={selectedProduct.descripcion} class="max-h-[40vh] md:max-h-[60vh] object-contain drop-shadow-lg" />
				{:else}
					<div class="text-gray-300 flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12"/></svg><p>Sin imagen</p></div>
				{/if}
				{#if !selectedProduct.disponible}
					<div class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
						<span class="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg uppercase tracking-widest shadow-lg transform -rotate-6">Agotado</span>
					</div>
				{/if}
			</div>

			<div class="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
				<div class="flex-1">
					<p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{selectedProduct.categoria || 'General'}</p>
					<h2 class="text-2xl md:text-3xl font-black text-gray-800 leading-tight mb-4">{selectedProduct.descripcion}</h2>

					<div class="bg-orange-50 rounded-xl p-4 border border-orange-100 mb-6">
						<div class="flex justify-between items-end mb-2"><span class="text-sm font-bold text-gray-500 uppercase">Precio Mayor:</span><span class="text-3xl font-black text-[#FF6600]">Bs {selectedProduct.preciopormayor}</span></div>
						<div class="h-px bg-orange-200/50 w-full my-2"></div>
						<div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-400 uppercase">Unidad:</span><span class="text-lg font-bold text-gray-600">Bs {selectedProduct.precioUnidad}</span></div>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="bg-gray-50 p-3 rounded-lg text-center border border-gray-100"><span class="block text-[10px] uppercase font-bold text-gray-400">Código</span><span class="block text-sm font-bold text-gray-800">{selectedProduct.codigo || 'N/A'}</span></div>
						<div class="bg-gray-50 p-3 rounded-lg text-center border border-gray-100"><span class="block text-[10px] uppercase font-bold text-gray-400">Mínimo</span><span class="block text-sm font-bold text-gray-800">{selectedProduct.moq} Uds.</span></div>
					</div>
				</div>
				<a href="https://wa.me/59161333335?text=Hola,%20me%20interesa%20{selectedProduct.descripcion}%20(Código:%20{selectedProduct.codigo})" target="_blank" class="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
					Pedir por WhatsApp
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-marquee { display: inline-flex; animation: marquee 20s linear infinite; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
</style>