<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { browser } from '$app/environment';
	import { fade, slide } from 'svelte/transition';
	import { writable } from 'svelte/store';

	const PHONE = '59161333335';

	// ✅ FIX: Reemplaza URLs viejas al vuelo
	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	function enviarWhatsApp() {
		if (!$cart.items.length) return;
		let mensaje = "Hola Ale Importadora. Mi pedido detallado:\n\n";
		$cart.items.forEach((item: any) => {
			mensaje += `Producto: ${item.product.descripcion}\n`;
			mensaje += `Ref: ${item.product.codigo}\n`;
			mensaje += `Cant: ${item.quantity} (MOQ: ${item.product.moq || 12})\n`;
			mensaje += `Subtotal: Bs. ${(item.product.preciopormayor * item.quantity).toFixed(2)}\n\n`;
		});
		mensaje += `TOTAL DEL PEDIDO: Bs. ${$cart.total.toFixed(2)}`;
		if (browser) window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`, '_blank');
	}

	function bajarCantidad(item: any) {
		const minimo = item.product.moq || 12;
		if (item.quantity > minimo) {
			cart.updateQuantity(item.product.$id, -1);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cart.setIsOpen(false);
	}

	function calcularDescuento(precio: number, descuento: number): number {
		return precio - (precio * descuento) / 100;
	}

	export const selectedProduct = writable(null);
</script>

<div class="fixed right-4 bottom-4 z-[400] flex flex-col items-end gap-4 pointer-events-none">
	<button
		on:click={() => cart.setIsOpen(!$cart.isOpen)}
		aria-label="Ver mi pedido"
		class="relative h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#0085FF] text-white shadow-2xl flex items-center justify-center pointer-events-auto transition-transform active:scale-90 hover:scale-105"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
		{#if $cart.items.length > 0}
			<span class="absolute -top-1 -right-1 bg-[#f7421e] text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
				{$cart.items.length}
			</span>
		{/if}
	</button>
</div>

{#if $cart.isOpen}
	<div class="fixed inset-0 z-[500] pointer-events-auto">
		<div
			role="button"
			tabindex="0"
			transition:fade
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			on:click={() => cart.setIsOpen(false)}
			on:keydown={handleKeydown}
			aria-label="Cerrar carrito"
		></div>

		<div transition:slide={{ axis: 'x', duration: 300 }} class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto">

			<div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
				<h2 class="text-lg font-black text-[#222] uppercase tracking-wide">Tu Pedido</h2>
				<button
					on:click={() => cart.setIsOpen(false)}
					class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
					aria-label="Cerrar panel"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9f9f9]">
				{#each $cart.items as item (item.product.$id)}
					<div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 relative group">

						<button
							on:click={() => cart.remove(item.product.$id)}
							class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"
							title="Eliminar del pedido"
							aria-label="Eliminar producto"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
						</button>

						<div class="h-20 w-20 bg-gray-50 rounded-xl flex-shrink-0">
							<img src="{fixUrl(item.product.imagen)}&width=150&quality=60" alt={item.product.descripcion} class="h-full w-full object-contain mix-blend-multiply" />
						</div>

						<div class="flex-1 flex flex-col justify-center pr-6">
							<h3 class="text-xs font-bold text-[#222] leading-tight mb-1 line-clamp-2 capitalize">{item.product.descripcion.toLowerCase()}</h3>
							<div class="text-[#222] font-black text-sm mb-2">Bs. {Number(item.price).toFixed(2)}</div>

							<div class="flex items-center bg-gray-100 rounded-lg w-fit">
								<button
									class="px-3 py-1 text-lg font-bold transition-colors {item.quantity <= (item.product.moq || 12) ? 'text-gray-300 cursor-not-allowed' : 'text-[#222] hover:text-[#0085FF] hover:bg-gray-200'}"
									on:click={() => bajarCantidad(item)}
									disabled={item.quantity <= (item.product.moq || 12)}
									aria-label="Reducir cantidad"
								>−</button>

								<span class="px-2 text-xs font-black text-[#222] min-w-[20px] text-center">{item.quantity}</span>

								<button
									class="px-3 py-1 text-[#222] text-lg font-bold hover:text-[#0085FF] hover:bg-gray-200 rounded-r-lg transition-colors"
									on:click={() => cart.updateQuantity(item.product.$id, 1)}
									aria-label="Aumentar cantidad"
								>+</button>
							</div>

							{#if item.quantity <= (item.product.moq || 12)}
								<span class="text-[9px] text-orange-500 font-bold mt-1">Mínimo: {item.product.moq || 12} un.</span>
							{/if}
						</div>
					</div>
				{/each}

				{#if $cart.items.length === 0}
					<div class="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
						<p class="text-sm font-bold uppercase tracking-widest">Tu carrito está vacío</p>
					</div>
				{/if}
			</div>

			{#if $cart.items.length > 0}
				<div class="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
					<div class="flex justify-between items-end mb-6">
						<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Estimado</span>
						<div class="flex flex-col items-end">
							<span class="text-2xl font-black text-[#222]">Bs. {$cart.total.toFixed(2)}</span>
							<span class="text-[10px] text-gray-400 font-medium">No incluye envío</span>
						</div>
					</div>
					<button
						on:click={enviarWhatsApp}
						class="w-full bg-[#00C853] hover:bg-[#00a844] text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.1em] shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
					>
						<span>Confirmar Pedido</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
