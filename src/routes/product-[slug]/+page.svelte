<script lang="ts">
	export let data;
	$: product = data?.product;
	$: foto = product?.imagen || product?.images?.[0] || '';

	let zoom = false;
</script>

{#if product}
	<div class="min-h-screen bg-white flex flex-col relative font-sans">

		<header class="p-4 flex items-center gap-4 border-b border-gray-100 bg-white sticky top-0 z-50">
			<a href="/" class="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-black transition-colors" aria-label="Volver al catálogo">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
			</a>
			<div class="flex flex-col">
				<span class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Sección</span>
				<span class="text-xs font-bold text-black uppercase italic truncate max-w-[200px]">{product.categoria || 'Producto'}</span>
			</div>
		</header>

		<main class="flex-1 flex flex-col items-center p-4 pb-10">

			<button
				type="button"
				class="w-full max-w-xl bg-gray-50 rounded-[30px] border border-gray-100 p-6 flex flex-col items-center justify-center relative cursor-zoom-in active:scale-[0.98] transition-transform"
				on:click={() => zoom = true}
				aria-label="Ampliar imagen"
			>
				<div class="w-full aspect-square flex items-center justify-center mb-4">
					{#if foto}
						<img src={foto} alt={product.descripcion} class="w-full h-full object-contain mix-blend-multiply" />
					{:else}
						<div class="text-gray-300 font-bold italic uppercase flex flex-col items-center">
							<i class="bi bi-image text-4xl mb-2"></i>
							Sin Imagen
						</div>
					{/if}
				</div>

				<div class="bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-sm">
				<span class="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
					🔍 Toca para ampliar
				</span>
				</div>
			</button>

			<div class="mt-6 text-center max-w-lg px-2 mb-8 flex flex-col gap-0">
				<h1 class="text-2xl font-[1000] text-gray-900 uppercase italic leading-none mb-1">
					{product.descripcion}
				</h1>
				<p class="text-xs font-bold text-gray-400 tracking-wider">CÓDIGO: {product.codigo}</p>
			</div>

			<a
				href="/"
				class="flex items-center gap-2 bg-[#ff5000] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg hover:scale-105 transition-transform hover:bg-[#ff6600]"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
				Volver al catálogo
			</a>

		</main>

		{#if zoom}
			<div
				class="fixed inset-0 z-[9999] bg-white flex items-center justify-center animate-in fade-in duration-200"
				role="dialog"
				aria-modal="true"
			>
				<button
					type="button"
					class="absolute top-6 right-6 z-[10000] p-4 bg-gray-100 rounded-full text-black shadow-lg active:scale-90 transition-transform"
					on:click|stopPropagation={() => zoom = false}
					aria-label="Cerrar zoom"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>

				<div class="absolute inset-0 bg-white" on:click={() => zoom = false}></div>

				<img
					src={foto}
					alt=""
					class="relative z-10 w-full h-full object-contain p-2 pointer-events-none select-none"
				/>

				<div class="absolute bottom-10 z-10 pointer-events-none">
					<p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] bg-white/90 px-3 py-1 rounded-full">Modo Captura 📸</p>
				</div>
			</div>
		{/if}

	</div>
{/if}