<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { browser } from '$app/environment';
	import { slide } from 'svelte/transition';

	const PHONE = '59161333335';

	function enviarWhatsApp() {
		if (!$cart.items.length) return;
		let mensaje = "Hola Ale Importadora. Mi pedido detallado:\n\n";
		$cart.items.forEach((item: any) => {
			mensaje += `Producto: ${item.product.descripcion}\n`;
			mensaje += `Referencia: ${item.product.codigo}\n`;
			mensaje += `Cantidad: ${item.quantity} unidades\n`;
			mensaje += `Subtotal: Bs. ${(item.price * item.quantity).toFixed(2)}\n\n`;
		});
		mensaje += `TOTAL DEL PEDIDO: Bs. ${$cart.total.toFixed(2)}`;
		if (browser) window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`, '_blank');
	}
</script>

<div class="fixed right-4 bottom-4 z-[400] flex flex-col items-end gap-4 pointer-events-none">

	<button
		on:click={() => cart.setIsOpen(!$cart.isOpen)}
		aria-label="Ver mi pedido"
		class="relative h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#0085FF] shadow-2xl shadow-blue-500/30 flex items-center justify-center border-2 border-white pointer-events-auto hover:scale-110 transition-transform animate-pulse-blue"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
		{#if $cart.count > 0}
			<span class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center text-[9px] md:text-[10px] font-black border-2 border-white">{$cart.count}</span>
		{/if}
	</button>

	{#if $cart.isOpen}
		<div transition:slide class="w-[300px] md:w-[320px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col pointer-events-auto overflow-hidden">
			<div class="p-4 border-b bg-[#0085FF] text-white flex justify-between items-center">
				<h4 class="font-bold text-xs uppercase tracking-widest">Tu Carrito</h4>
				<button on:click={() => cart.setIsOpen(false)} aria-label="Cerrar">✕</button>
			</div>

			<div class="flex-1 max-h-[350px] md:max-h-[400px] overflow-y-auto p-3 space-y-3 bg-gray-50 no-scrollbar">
				{#each $cart.items as item}
					<div class="flex gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
						<img src={item.product.imagen} alt="" class="w-12 h-12 object-contain bg-gray-50 rounded-lg" />
						<div class="flex-1 min-w-0">
							<div class="text-[10px] font-bold text-gray-800 line-clamp-1">{item.product.descripcion}</div>
							<div class="text-[10px] font-black text-[#f7421e]">Bs. {(item.price * item.quantity).toFixed(2)}</div>
							<div class="mt-1 flex items-center bg-white border border-gray-200 rounded-lg w-fit">
								<button class="px-2 text-gray-400 hover:text-[#0085FF]" on:click={() => cart.updateQuantity(item.product.$id, -1)} aria-label="Menos">−</button>
								<span class="px-1 text-[10px] font-black">{item.quantity}</span>
								<button class="px-2 text-gray-400 hover:text-[#0085FF]" on:click={() => cart.updateQuantity(item.product.$id, 1)} aria-label="Más">+</button>
							</div>
						</div>
					</div>
				{/each}
				{#if $cart.items.length === 0}
					<div class="text-center py-8 text-gray-400 text-xs">Tu carrito está vacío</div>
				{/if}
			</div>
			<div class="p-4 bg-white border-t border-gray-100">
				<div class="flex justify-between items-center mb-4">
					<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
					<span class="text-xl font-black text-gray-900">Bs. {$cart.total.toFixed(2)}</span>
				</div>
				<button class="w-full bg-[#00C853] hover:bg-[#00963e] text-white py-4 rounded-xl font-bold text-xs uppercase shadow-md shadow-green-100 transition-colors" on:click={enviarWhatsApp}>
					Confirmar por WhatsApp
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }

    .animate-pulse-blue {
        animation: pulse-blue 3s infinite;
    }
    @keyframes pulse-blue {
        0% { box-shadow: 0 0 0 0 rgba(0, 133, 255, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(0, 133, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 133, 255, 0); }
    }
</style>