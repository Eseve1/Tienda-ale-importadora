<script>
	import { onMount, onDestroy } from 'svelte';
	// Asegúrate de tener RetailCard. Si no, usa WholesaleCard aquí también.
	import RetailCard from '$lib/components/grid/RetailCard.svelte';

	export let data;
	$: productos = data?.allProducts || [];

	// --- 1. LÓGICA DE FILTRADO (SOLO CATEGORÍAS) ---
	let catActual = "Todo";

	const categorias = [
		"Todo", "Belleza y salud", "Herramientas", "Hogar y cocina",
		"Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"
	];

	function normalizar(texto) {
		return (texto || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
	}

	$: productosFiltrados = productos.filter(p => {
		if (catActual === "Todo") return true;

		const catProducto = normalizar(p.categoria || p.category);
		const catFiltro = normalizar(catActual);

		// Coincidencia flexible
		return catProducto.includes(catFiltro) || catFiltro.includes(catProducto);
	});

	// --- 2. LÓGICA RELOJ (FIN DE MES) ---
	let dias = 0, horas = 0, minutos = 0, segundos = 0;
	let intervalo;

	function actualizarReloj() {
		const ahora = new Date();
		// Fin de mes actual
		const finDeMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

		const diff = finDeMes.getTime() - ahora.getTime();

		if (diff > 0) {
			dias = Math.floor(diff / (1000 * 60 * 60 * 24));
			horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
			minutos = Math.floor((diff / (1000 * 60)) % 60);
			segundos = Math.floor((diff / 1000) % 60);
		}
	}

	onMount(() => {
		actualizarReloj();
		intervalo = setInterval(actualizarReloj, 1000);
	});

	onDestroy(() => {
		if (intervalo) clearInterval(intervalo);
	});

	// --- 3. SCROLL ---
	let showBackToTop = false;
	function handleScroll() { showBackToTop = window.scrollY > 300; }
	function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-[#f6f8fb] font-sans flex flex-col">

	<div class="bg-gradient-to-r from-[#ff4014] to-[#ff8c00] py-4 px-4 shadow-md text-center border-b border-white/10 sticky top-0 z-50">
		<div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

			<div class="flex items-center gap-3 w-full md:w-auto">
				<a href="/" class="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all flex-shrink-0 group flex items-center justify-center no-underline">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="group-hover:-translate-x-1 transition-transform"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>
				</a>

				<div class="text-left">
					<h1 class="text-white text-xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none">
						OFERTAS DE MES
					</h1>
					<p class="text-white text-[10px] md:text-xs font-bold opacity-90 uppercase tracking-widest mt-1">
						PRECIOS POR UNIDAD - CIERRE EN:
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 bg-black/10 px-3 py-2 rounded-xl border border-white/5">
				<div class="flex flex-col items-center">
					<div class="bg-white text-[#ff4014] w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg shadow-lg leading-none">{dias}</div>
					<span class="text-[8px] text-white font-bold uppercase mt-1">Días</span>
				</div>
				<span class="text-white font-black text-xl pb-4">:</span>

				<div class="flex flex-col items-center">
					<div class="bg-black text-white w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg border border-white/10 shadow-lg leading-none">{horas < 10 ? '0' + horas : horas}</div>
					<span class="text-[8px] text-white font-bold uppercase mt-1">Hs</span>
				</div>
				<span class="text-white font-black text-xl pb-4">:</span>

				<div class="flex flex-col items-center">
					<div class="bg-black text-white w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg border border-white/10 shadow-lg leading-none">{minutos < 10 ? '0' + minutos : minutos}</div>
					<span class="text-[8px] text-white font-bold uppercase mt-1">Min</span>
				</div>
				<span class="text-white font-black text-xl pb-4">:</span>

				<div class="flex flex-col items-center">
					<div class="bg-[#ff4014] text-white w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg border border-white/10 shadow-lg leading-none">{segundos < 10 ? '0' + segundos : segundos}</div>
					<span class="text-[8px] text-white font-bold uppercase mt-1">Seg</span>
				</div>
			</div>

		</div>
	</div>

	<div class="sticky top-[86px] z-40 bg-[#f6f8fb]/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-3 px-2">
		<div class="max-w-[1400px] mx-auto">
			<div class="flex gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center">
				{#each categorias as cat}
					<button
						class="whitespace-nowrap px-4 py-2 rounded-full font-bold text-[11px] border transition-all shadow-sm active:scale-95
              {catActual === cat
               ? 'bg-[#ff4014] text-white border-[#ff4014]'
               : 'bg-white text-gray-600 border-gray-200 hover:border-[#ff4014] hover:text-[#ff4014]'}"
						on:click={() => catActual = cat}
					>
						{cat}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="max-w-[1400px] mx-auto p-4 md:p-8 flex-1 w-full">
		<p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 px-1">
			Mostrando: {catActual} ({productosFiltrados.length})
		</p>

		<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
			{#each productosFiltrados as prod (prod.$id)}
				<RetailCard product={prod} />
			{:else}
				<div class="col-span-full py-20 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="opacity-20" viewBox="0 0 16 16"><path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0"/><path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1m0 5.586 7 7L13.586 9l-7-7H2z"/></svg>
					No hay ofertas en esta categoría hoy.
				</div>
			{/each}
		</div>
	</div>

	<footer class="bg-white border-t border-gray-200 py-10 mt-auto relative z-10 text-center">
		<div class="max-w-[1400px] mx-auto px-4 text-center">
			<h4 class="font-black text-[#333] uppercase tracking-tighter text-lg mb-2">Ale Importadora</h4>
			<p class="text-xs text-gray-500 font-medium mb-6">Importación directa.</p>
			<div class="w-10 h-1 bg-[#FF6600] mx-auto rounded-full mb-6"></div>
		</div>
	</footer>

	<div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end">

		{#if showBackToTop}
			<button
				on:click={scrollToTop}
				class="bg-white text-[#ff4014] w-12 h-12 rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform flex items-center justify-center"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5"/></svg>
			</button>
		{/if}

		<a href="https://maps.app.goo.gl/..." target="_blank" class="bg-white text-gray-700 px-3 py-2 rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2 border border-gray-200 group no-underline">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-gray-400" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>
			<span class="text-[10px] font-bold uppercase tracking-wide">Tienda Los Grigotá</span>
		</a>

		<a href="https://maps.app.goo.gl/..." target="_blank" class="bg-[#ff4014] text-white px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 group animate-bounce-slow no-underline">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
			<span class="text-[12px] font-[900] uppercase tracking-wide">Tienda Aroma</span>
		</a>

	</div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
</style>