<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let product: any;

	const dispatch = createEventDispatcher();

	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('showLocations', product);
		}
	}

	// 🧠 LÓGICA DE PRECIO AL DETALLE: Aplicar 20% de descuento
	$: originalPrice = Number(product.precioUnidad);
	$: discountedPrice = originalPrice * 0.8;
	$: formattedPrice = discountedPrice.toFixed(2);
	$: [intPart, decPart] = formattedPrice.split('.');
</script>

<div
	class="group bg-white flex flex-col cursor-pointer font-sans h-full p-2 border border-transparent hover:border-[#FF6A00] hover:shadow-lg rounded-xl transition-all duration-200 { !product.disponible ? 'opacity-60' : '' }"
	on:click={() => dispatch('showLocations', product)}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="aspect-square w-full relative bg-[#F8F8F8] rounded-md overflow-hidden">
		{#if !product.disponible}
			<div class="absolute top-0 right-0 z-20 bg-[#B12704] text-white text-[11px] font-bold px-2 py-1 shadow-sm">
				Agotado
			</div>
		{/if}

		<img
			src="{fixUrl(product.imagen)}&width=400&height=400&quality=75&output=webp"
			alt={product.descripcion}
			loading="lazy"
			class="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105 { !product.disponible ? 'grayscale' : '' }"
		/>
	</div>

	<div class="flex flex-col flex-1 pt-2">

		<h3 class="font-sans text-[#0F1111] text-[13px] md:text-[14px] leading-[18px] line-clamp-2 h-[36px] group-hover:text-[#FF6A00] capitalize transition-colors">
			{product.descripcion.toLowerCase()}
		</h3>

		<div class="mt-1 flex flex-col mb-auto">

			<div class="flex items-end gap-1.5 text-[#0F1111] mb-0.5">
				<span class="text-[11px] font-black text-[#B12704] bg-[#FFF0ED] px-1 py-0.5 rounded-sm mb-1">-20%</span>
				<div class="flex items-start">
					<span class="text-[11px] leading-tight pt-[3px] mr-[1px] font-bold">Bs.</span>
					<span class="font-sans text-[24px] md:text-[28px] font-bold leading-none tracking-tight">{intPart}</span>
					<span class="text-[11px] leading-tight pt-[2px] font-bold">{decPart}</span>
				</div>
			</div>

			<div class="text-[11px] leading-[15px] flex flex-col gap-1 mt-0.5">
				<span class="text-[#565959]">
					Antes: <span class="line-through text-gray-400 mx-0.5">Bs.{originalPrice.toFixed(2)}</span>
				</span>
				<span class="text-[#565959] font-medium flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
					Solo en tienda física
				</span>
			</div>
		</div>

		<div class="mt-2.5 pt-1">
			{#if product.disponible}
				<button
					class="w-full bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-[13px] py-2 rounded-full shadow-md shadow-orange-500/20 transition-all active:scale-95 flex justify-center items-center gap-1"
				>
					Comprar
				</button>
			{:else}
				<button
					disabled
					class="w-full bg-[#F7F8F8] text-[#565959] font-medium text-[13px] py-2 rounded-full border border-[#D5D9D9] cursor-not-allowed"
				>
					Agotado
				</button>
			{/if}
		</div>
	</div>
</div>