<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cart } from '$lib/stores/cart';

	export let product: any;
	export let index: number = 0;
	export let showUnitPrice: boolean = false;

	const dispatch = createEventDispatcher();

	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('select', product);
		}
	}

	function addToCart(e: Event) {
		e.stopPropagation();
		const quantity = product.moq || 12;
		const priceType = showUnitPrice ? 'unidad' : 'mayorista';
		cart.add(product, quantity, priceType);
	}

	$: rawPrice = showUnitPrice ? (Number(product.precioUnidad) * 0.8) : (Number(product.preciopormayor) * (product.moq || 12));
	$: formattedPrice = rawPrice.toFixed(2);
	$: [intPart, decPart] = formattedPrice.split('.');
</script>

<div
	class="group bg-white flex flex-col cursor-pointer font-sans h-full border border-transparent hover:border-[#FF6A00] hover:shadow-lg rounded-xl transition-all duration-200 overflow-hidden { !product.disponible ? 'opacity-60' : '' }"
	on:click={() => dispatch('select', product)}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="aspect-square w-full relative bg-[#F8F8F8] overflow-hidden">

		{#if !product.disponible}
			<div class="absolute top-0 right-0 z-20 bg-[#B12704] text-white text-[11px] font-bold px-2 py-1 shadow-sm">
				Agotado
			</div>
		{/if}

		<img
			src="{fixUrl(product.imagen)}&width=300&height=300&quality=75&output=webp"
			alt={product.descripcion}
			loading={index < 4 ? "eager" : "lazy"}
			fetchpriority={index < 4 ? "high" : "auto"}
			class="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 { !product.disponible ? 'grayscale' : '' }"
		/>
	</div>

	<div class="flex flex-col flex-1 p-2.5">

		<h3 class="font-sans text-[#0F1111] text-[13px] md:text-[14px] leading-[18px] line-clamp-2 h-[36px] group-hover:text-[#FF6A00] capitalize transition-colors">
			{product.descripcion.toLowerCase()}
		</h3>

		<div class="mt-1 flex flex-col mb-auto">
			<div class="flex items-end gap-1.5 text-[#0F1111] mb-0.5">
				<div class="flex items-start">
					<span class="text-[11px] leading-tight pt-[3px] mr-[1px] font-bold">Bs.</span>
					<span class="font-sans text-[24px] md:text-[28px] font-bold leading-none tracking-tight">{intPart}</span>
					<span class="text-[11px] leading-tight pt-[2px] font-bold">{decPart}</span>
				</div>
			</div>

			<div class="text-[11.5px] leading-[16px] text-[#565959] mt-0.5">
				Compra mínima: {product.moq || 12} unid. <br/>
				<span class="font-bold text-[#0F1111]">Bs. {Number(product.preciopormayor).toFixed(2)} c/u</span>
			</div>
		</div>

		<div class="mt-2.5 pt-1">
			{#if product.disponible}
				<button
					on:click={addToCart}
					class="w-full bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-[13px] py-2 rounded-lg transition-all active:scale-95 flex justify-center items-center gap-2"
				>
					Agregar
				</button>
			{:else}
				<button
					disabled
					class="w-full bg-[#F7F8F8] text-[#565959] font-medium text-[13px] py-2 rounded-lg border border-[#D5D9D9] cursor-not-allowed"
				>
					Agotado
				</button>
			{/if}
		</div>
	</div>
</div>