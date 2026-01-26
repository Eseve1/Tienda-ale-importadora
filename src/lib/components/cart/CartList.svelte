<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { fade } from 'svelte/transition';

	const optimizar = (url: string) => {
		if (!url) return '/placeholder.png';
		if (url.includes('cloud.appwrite.io')) return url + '&width=100&output=webp';
		return url;
	}

	let { } = $props();
</script>

<div class="flex flex-col pb-24">
	{#if cart.getItems().length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center opacity-50">
			<span class="text-4xl mb-2">🛒</span>
			<p>Tu carrito está vacío</p>
		</div>
	{:else}
		{#each cart.getItems() as item (item.slug)}
			<div transition:fade class="flex gap-3 py-3 border-b border-gray-100 last:border-0 group">
				<div class="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
					<img
						src={optimizar(item.product.images?.[0])}
						alt={item.product.name}
						class="h-full w-full object-contain p-0.5"
					/>
				</div>

				<div class="flex flex-1 flex-col justify-between">
					<div class="flex justify-between items-start">
						<div class="pr-2">
							<h3 class="text-[13px] font-bold text-gray-900 leading-tight line-clamp-2">
								{item.product.name}
							</h3>
							{#if item.product.codigo}
								<div class="mt-1 inline-block bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono border border-gray-200">
									REF: <span class="text-gray-700 font-bold">{item.product.codigo}</span>
								</div>
							{/if}
						</div>

						<div class="text-right">
							<span class="text-[10px] text-gray-400">Unitario</span>
							<div class="text-[12px] font-medium text-gray-700">Bs. {item.price.toFixed(2)}</div>
						</div>
					</div>

					<div class="flex items-center justify-between mt-2">
						<div class="flex items-center h-6 border border-gray-300 rounded bg-white shadow-sm">
							<button
								onclick={() => cart.updateQuantity(item.product, item.features, item.quantity - 1)}
								class="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 border-r border-gray-200 font-bold"
							>-</button>
							<span class="w-8 text-center text-[12px] font-bold text-gray-900">{item.quantity}</span>
							<button
								onclick={() => cart.updateQuantity(item.product, item.features, item.quantity + 1)}
								class="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 font-bold"
							>+</button>
						</div>

						<div class="flex items-center gap-3">
							<button
								onclick={() => cart.remove(item.product, item.features)}
								class="text-[10px] text-red-400 underline hover:text-red-600"
							>
								Borrar
							</button>
							<div class="text-[13px] font-black text-[#B12704]">
								Bs. {(item.price * item.quantity).toFixed(2)}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>