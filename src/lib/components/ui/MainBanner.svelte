<script>
	import { onMount } from 'svelte';

	// URLs de fotos de tus productos estrella
	const slides = [
		{ image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', title: 'CALIDAD PREMIUM' },
		{ image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop', title: 'IMPORTACIÓN DIRECTA' },
		{ image: 'https://images.unsplash.com/photo-1526170315876-3d8c91aa3d67?q=80&w=2070&auto=format&fit=crop', title: 'STOCK REAL EN SCZ' }
	];

	let actual = 0;
	onMount(() => {
		const interval = setInterval(() => { actual = (actual + 1) % slides.length; }, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="relative w-full h-[300px] md:h-[500px] rounded-[32px] overflow-hidden mb-10 bg-black shadow-xl">
	{#each slides as slide, i}
		<div class="absolute inset-0 transition-opacity duration-700 {actual === i ? 'opacity-100' : 'opacity-0'}">
			<img src={slide.image} alt="" class="w-full h-full object-cover opacity-60" />
			<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 flex flex-col items-center justify-center text-center p-6">
				<h1 class="text-4xl md:text-8xl font-[1000] text-white uppercase tracking-tighter">{slide.title}</h1>
				<div class="h-1.5 w-24 bg-[#ff4014] mt-4"></div>
			</div>
		</div>
	{/each}

	<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
		{#each slides as _, i}
			<div class="w-2.5 h-2.5 rounded-full {actual === i ? 'bg-[#ff4014]' : 'bg-white/40'}"></div>
		{/each}
	</div>
</div>