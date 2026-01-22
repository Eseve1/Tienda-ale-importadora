<script lang="ts">
	export let data;
	$: product = data?.product;

	// 1. Array seguro de imágenes (Detecta si hay varias o solo una)
	$: images = (product?.images && product.images.length > 0)
		? product.images
		: [product?.imagen || ''];

	// Referencia para el scroll
	let scrollContainer: HTMLElement;
	let currentImageIndex = 0;

	// Función para mover con flechas
	const scroll = (direction: 'left' | 'right') => {
		if (!scrollContainer) return;
		const scrollAmount = scrollContainer.clientWidth;
		if (direction === 'left') {
			scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
		} else {
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	};

	// Detectar qué foto se ve al deslizar con el dedo
	const handleScroll = () => {
		if (!scrollContainer) return;
		const index = Math.round(scrollContainer.scrollLeft / scrollContainer.clientWidth);
		currentImageIndex = index;
	};

	let zoom = false;
</script>

{#if product}
	<div class="min-h-screen bg-white flex flex-col relative font-sans">

		<header class="p-4 flex items-center gap-4 border-b border-gray-100 bg-white sticky top-0 z-50">
			<a href="/" class="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-black transition-colors">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
			</a>
			<div class="flex flex-col">
				<span class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Sección</span>
				<span class="text-xs font-bold text-black uppercase italic truncate max-w-[200px]">{product.categoria || 'Producto'}</span>
			</div>
		</header>

		<main class="flex-1 flex flex-col items-center p-4 pb-10 w-full max-w-xl mx-auto">

			<div class="relative w-full aspect-square bg-gray-50 rounded-[30px] border border-gray-100 overflow-hidden group">

				<div
					class="flex overflow-x-auto snap-x snap-mandatory w-full h-full no-scrollbar"
					bind:this={scrollContainer}
					on:scroll={handleScroll}
				>
					{#each images as img, i}
						<div class="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-6 relative">
							<button class="w-full h-full" on:click={() => zoom = true}>
								<img
									src={img}
									alt="{product.descripcion} - foto {i+1}"
									class="w-full h-full object-contain mix-blend-multiply"
								/>
							</button>
						</div>
					{/each}
				</div>

				{#if images.length > 1}
					<button
						class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 shadow-md text-black p-3 rounded-full opacity-70 hover:opacity-100 disabled:opacity-0 transition-all"
						on:click={() => scroll('left')}
						disabled={currentImageIndex === 0}
					>
						⬅
					</button>

					<button
						class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 shadow-md text-black p-3 rounded-full opacity-70 hover:opacity-100 disabled:opacity-0 transition-all"
						on:click={() => scroll('right')}
						disabled={currentImageIndex === images.length - 1}
					>
						➡
					</button>

					<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
						{#each images as _, i}
							<div class="w-2 h-2 rounded-full transition-all duration-300 shadow-sm {currentImageIndex === i ? 'bg-[#ff5000] w-6' : 'bg-gray-300'}"></div>
						{/each}
					</div>

					<div class="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">
						{currentImageIndex + 1} / {images.length}
					</div>
				{/if}
			</div>

			<div class="mt-6 text-center w-full px-2 mb-8">
				<h1 class="text-2xl font-[1000] text-gray-900 uppercase italic leading-none mb-1">
					{product.descripcion}
				</h1>
				<p class="text-xs font-bold text-gray-400 tracking-wider">CÓDIGO: {product.codigo}</p>
			</div>

			<a
				href="/"
				class="flex items-center gap-2 bg-[#ff5000] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg hover:scale-105 transition-transform"
			>
				Volver al catálogo
			</a>

		</main>

		{#if zoom}
			<div class="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-center animate-in fade-in">
				<button class="absolute top-6 right-6 z-[10000] text-white p-4" on:click={() => zoom = false}>
					✖
				</button>
				<div class="w-full h-3/4 flex overflow-x-auto snap-x snap-mandatory items-center no-scrollbar">
					{#each images as img}
						<img src={img} alt="" class="w-full h-full object-contain flex-shrink-0 snap-center p-2" />
					{/each}
				</div>
				<p class="text-white text-center mt-4 text-xs font-bold uppercase tracking-widest">Desliza para ver más</p>
			</div>
		{/if}

	</div>
{/if}

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>