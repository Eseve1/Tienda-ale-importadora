<script lang="ts">
	// Importamos el store y el componente hijo
	import { cart } from '$lib/stores/cart.svelte';
	import CartItem from './CartItem.svelte';
</script>

<div class="flex flex-col w-full">

	{#if cart.getItems().length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="text-4xl mb-2 opacity-30">🛒</div>
			<p class="text-gray-500 text-sm font-medium">Tu carrito está vacío.</p>
		</div>

	{:else}
		<div class="flex flex-col divide-y divide-gray-100">
			{#each cart.getItems() as item (item.slug)}
				<CartItem {item} />
			{/each}
		</div>
	{/if}

</div>