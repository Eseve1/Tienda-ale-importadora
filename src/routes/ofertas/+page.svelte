<script>
	import { onMount } from 'svelte';
	import RetailCard from '$lib/components/grid/RetailCard.svelte';

	export let data;
	$: productos = data?.allProducts || [];

	// --- LÓGICA RELOJ ---
	let dias = 0, horas = 0, minutos = 0, segundos = 0;
	function actualizarReloj() {
		const ahora = new Date();
		const diaActual = ahora.getDate();
		let objetivo;
		if (diaActual <= 15) {
			objetivo = new Date(ahora.getFullYear(), ahora.getMonth(), 15, 23, 59, 59);
		} else {
			objetivo = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
		}
		const diff = objetivo.getTime() - ahora.getTime();
		if (diff > 0) {
			dias = Math.floor(diff / (1000 * 60 * 60 * 24));
			horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
			minutos = Math.floor((diff / (1000 * 60)) % 60);
			segundos = Math.floor((diff / 1000) % 60);
		}
	}

	// --- LÓGICA VOLVER ARRIBA ---
	let showBackToTop = false;
	function handleScroll() {
		showBackToTop = window.scrollY > 300;
	}
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	onMount(() => {
		actualizarReloj();
		const interval = setInterval(actualizarReloj, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-[#f6f8fb] font-sans flex flex-col">

	<div class="bg-gradient-to-r from-[#ff4014] to-[#ff8c00] py-4 md:py-6 px-4 shadow-md text-center border-b border-white/10 sticky top-0 z-50">
		<div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

			<div class="flex items-center gap-3 w-full md:w-auto">
				<a href="/" class="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all flex-shrink-0 group">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
				</a>

				<div class="text-left">
					<h1 class="text-white text-xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none">
						Ofertas instantáneas
					</h1>
					<p class="text-white text-[9px] md:text-xs font-bold opacity-90 uppercase tracking-widest mt-1">
						Ahorrá el 20% en Aroma y Cañoto
					</p>
				</div>
			</div>

			<div class="flex items-center gap-3 bg-black/10 px-4 py-2 rounded-2xl border border-white/5">
				<span class="text-white font-black text-[9px] uppercase tracking-tighter opacity-70 hidden md:inline">Termina en:</span>
				<div class="flex items-center gap-1.5">
					<div class="flex items-center gap-1">
						<div class="bg-white text-[#ff4014] w-8 h-8 flex items-center justify-center rounded-md font-black text-lg shadow-sm">{dias}</div>
						<span class="text-[8px] text-white font-bold uppercase">D</span>
					</div>
					<span class="text-white font-black text-lg">:</span>
					<div class="bg-black text-white w-8 h-8 flex items-center justify-center rounded-md font-black text-lg border border-white/10">{horas < 10 ? '0' + horas : horas}</div>
					<span class="text-white font-black text-lg">:</span>
					<div class="bg-black text-white w-8 h-8 flex items-center justify-center rounded-md font-black text-lg border border-white/10">{minutos < 10 ? '0' + minutos : minutos}</div>
					<span class="text-white font-black text-lg">:</span>
					<div class="bg-black text-white w-8 h-8 flex items-center justify-center rounded-md font-black text-lg border border-white/10">{segundos < 10 ? '0' + segundos : segundos}</div>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-[1400px] mx-auto p-4 md:p-8 flex-1 w-full">
		<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
			{#each productos as prod}
				<RetailCard product={prod} />
			{/each}
		</div>
	</div>

	<footer class="bg-white border-t border-gray-200 py-10 mt-auto relative z-10">
		<div class="max-w-[1400px] mx-auto px-4 text-center">
			<h4 class="font-black text-[#333] uppercase tracking-tighter text-lg mb-2">Ale Importadora</h4>
			<p class="text-xs text-gray-500 font-medium mb-6">Importación directa y distribución mayorista en Bolivia.</p>

			<div class="flex justify-center gap-6 mb-8 text-sm text-gray-600">
				<a href="/" class="hover:text-[#FF6600]">Inicio</a>
				<a href="/ofertas" class="text-[#FF6600] font-bold">Liquidación</a>
				<a href="https://wa.me/59161333335" class="hover:text-[#FF6600]">Contacto Mayorista</a>
			</div>

			<div class="w-10 h-1 bg-[#FF6600] mx-auto rounded-full mb-6"></div>

			<p class="text-[10px] text-gray-400 uppercase tracking-widest">© 2025 AleImport. Todos los derechos reservados.</p>
			<p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
				Desarrollado con ❤️ por <a href="https://wa.me/59160819430" target="_blank" class="text-[#FF6600] hover:underline decoration-2">Eddy Severiche</a>
			</p>
		</div>
	</footer>

	<div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end">

		{#if showBackToTop}
			<button
				on:click={scrollToTop}
				class="bg-white text-[#ff4014] w-10 h-10 rounded-full shadow-md border border-gray-100 hover:scale-110 transition-transform flex items-center justify-center mb-1"
				aria-label="Subir arriba"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
			</button>
		{/if}

		<a
			href="https://www.google.com/maps/search/Ale+Importadora+Av+Grigota+Santa+Cruz"
			target="_blank"
			class="bg-white text-gray-700 px-3 py-2 rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2 border border-gray-200 group no-underline"
		>
			<i class="bi bi-geo-alt-fill text-gray-400 text-sm"></i>
			<span class="text-[10px] font-bold uppercase tracking-wide">Tienda Los Grigotá</span>
		</a>

		<a
			href="https://www.google.com/maps/search/Ale+Importadora+Calle+Aroma+560+Santa+Cruz"
			target="_blank"
			class="bg-[#ff4014] text-white px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 group animate-bounce-slow no-underline"
		>
			<i class="bi bi-cursor-fill text-white text-base transform group-hover:rotate-45 transition-transform"></i>
			<span class="text-[12px] font-[900] uppercase tracking-wide">Tienda Aroma</span>
		</a>

	</div>
</div>

<style>
    @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
    .animate-bounce-slow {
        animation: bounce-slow 3s infinite ease-in-out;
    }
</style>