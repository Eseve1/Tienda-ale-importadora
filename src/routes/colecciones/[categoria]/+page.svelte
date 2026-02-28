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

	$: unitPrice   = Number(product.preciopormayor);
	$: moq         = product.moq || 12;
	$: totalPrice  = unitPrice * moq;
	$: formattedPrice = totalPrice.toFixed(2);
</script>

<div
	class="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full cursor-pointer { !product.disponible ? 'opacity-60' : '' }"
	on:click={() => dispatch('select', product)}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="aspect-square w-full relative bg-white p-2 flex items-center justify-center">
		{#if !product.disponible}
			<div class="absolute top-3 left-3 z-20 bg-gray-900 text-white text-[10px] tracking-wider font-bold px-2.5 py-1 rounded uppercase">
				Agotado
			</div>
		{/if}

		<img
			src="{fixUrl(product.imagen)}&width=400&height=400&quality=85&output=webp"
			alt={product.descripcion}
			loading={index < 4 ? "eager" : "lazy"}
			fetchpriority={index < 4 ? "high" : "auto"}
			class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 { !product.disponible ? 'grayscale' : '' }"
		/>

		{#if product.disponible}
			<button
				on:click={addToCart}
				aria-label="Agregar al carrito"
				class="absolute bottom-3 right-3 bg-white border border-gray-200 text-gray-700 h-11 w-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#FF6A00] hover:text-white hover:border-[#FF6A00] hover:shadow-lg translate-y-2 group-hover:translate-y-0"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
				</svg>
			</button>
		{/if}
	</div>

	<div class="flex flex-col flex-1 p-4 pt-0">
		<h3 class="font-medium text-gray-700 text-[14px] leading-snug line-clamp-2 group-hover:text-[#FF6A00] transition-colors capitalize mb-1">
			{product.descripcion.toLowerCase()}
		</h3>

		<div class="mt-auto flex items-baseline gap-1.5 pt-2">
			<span class="text-xl font-black text-[#FF6A00]">
				Bs. {formattedPrice}
			</span>
			<span class="text-[12px] text-gray-400 font-medium">
				({moq} un.)
			</span>
		</div>
	</div>
</div>