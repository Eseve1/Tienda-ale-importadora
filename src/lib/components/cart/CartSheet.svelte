<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { Content, Header, Root, Title, Trigger } from '$lib/components/ui/sheet';

	const PHONE_NUMBER = "59161333335";

	function optimizar(url: string) {
		if (!url) return '/placeholder.png';
		if (url.includes('cloud.appwrite.io')) {
			return `${url}&width=150&quality=80&output=webp`;
		}
		return url;
	}

	function enviarPedido() {
		if (cart.items.length === 0) return;

		let msg = `Hola *Ale Importadora*, quiero cotizar este pedido:%0A%0A`;

		cart.items.forEach((item) => {
			const ref = item.product.codigo || 'S/N';
			const nombre = item.product.descripcion || item.product.name;
			const subtotal = (item.price * item.quantity).toFixed(2);
			msg += `— *${item.quantity}x* ${nombre} (Ref: ${ref}) TOTAL: Bs. ${subtotal}%0A`;
		});

		msg += `%0A*TOTAL APROX: Bs. ${cart.total.toFixed(2)}*%0A`;
		msg += `Quedo a la espera de confirmación.`;

		window.open(`https://wa.me/${PHONE_NUMBER}?text=${msg}`, '_blank');
	}
</script>

<div class="z-50 flex">
	<Root open={cart.isOpen} onOpenChange={(val) => cart.setIsOpen(val)}>

		<Trigger class="relative h-16 w-16 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-center hover:scale-110 hover:shadow-orange-500/20 transition-all duration-300 group">

			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700 group-hover:text-[#FF6600] transition-colors">
				<circle cx="9" cy="21" r="1"></circle>
				<circle cx="20" cy="21" r="1"></circle>
				<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
			</svg>

			{#if cart.count > 0}
              <span class="absolute top-0 right-0 bg-[#FF6600] text-white text-[11px] font-bold h-6 w-6 flex items-center justify-center rounded-full shadow-sm border-2 border-white animate-in zoom-in">
                  {cart.count}
              </span>
				<span class="absolute top-0 right-0 bg-[#FF6600] h-6 w-6 rounded-full animate-ping opacity-75"></span>
			{/if}
		</Trigger>

		<Content class="flex h-full w-full flex-col bg-white p-0 sm:max-w-md">
			<Header class="border-b px-6 py-4 bg-gray-50/80 backdrop-blur-sm">
				<div class="flex items-center justify-between">
					<Title class="text-lg font-bold text-gray-800 flex items-center gap-2">
						🛒 Tu Pedido
						<span class="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm text-xs">
                          {cart.count} items
                      </span>
					</Title>
				</div>
			</Header>

			<div class="flex-1 overflow-y-auto px-4 py-2 bg-[#f9fafb]">
				{#if cart.items.length === 0}
					<div class="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 gap-4">
						<div class="bg-gray-100 p-6 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
						</div>
						<p class="font-medium">Tu carrito está vacío</p>
					</div>
				{:else}
					<div class="space-y-3 mt-2">
						{#each cart.items as item (item.slug)}
							<div class="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-right-5 duration-300">
								<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
									<img src={optimizar(item.product.imagen)} alt={item.product.descripcion} class="h-full w-full object-contain mix-blend-multiply" />
								</div>
								<div class="flex flex-1 flex-col justify-between">
									<div class="flex justify-between items-start gap-2">
										<h4 class="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
											{item.product.descripcion || item.product.name}
										</h4>
										<button on:click={() => cart.remove(item.product.$id)} class="text-gray-300 hover:text-red-500 p-1 -mr-2 -mt-2 transition-colors">✕</button>
									</div>
									<div class="flex items-end justify-between mt-2">
										<div class="flex items-center bg-gray-50 rounded-lg h-8 border border-gray-200">
											<button on:click={() => cart.updateQuantity(item.product.$id, -1)} class="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm hover:bg-gray-200 rounded-l-lg transition-colors">-</button>
											<span class="text-xs font-bold w-6 text-center">{item.quantity}</span>
											<button on:click={() => cart.updateQuantity(item.product.$id, 1)} class="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm hover:bg-gray-200 rounded-r-lg transition-colors">+</button>
										</div>
										<div class="text-right">
											<div class="text-[10px] text-gray-400 font-medium uppercase">Subtotal</div>
											<div class="text-sm font-black text-[#FF6600]">Bs. {(item.price * item.quantity).toFixed(2)}</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="border-t border-gray-100 bg-white p-6 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
				<div class="flex justify-between items-end mb-4">
					<span class="text-sm text-gray-500 font-medium">Total Estimado:</span>
					<span class="text-3xl font-black text-[#FF6600] tracking-tight">Bs. {cart.total.toFixed(2)}</span>
				</div>
				<button on:click={enviarPedido} disabled={cart.items.length === 0} class="w-full bg-[#25D366] hover:bg-[#1fa851] text-white py-4 rounded-xl font-bold text-sm uppercase shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.792.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326z"/></svg>
					ENVIAR PEDIDO POR WHATSAPP
				</button>
				<p class="text-[10px] text-center text-gray-400 mt-3 font-medium">Al enviar, un asesor confirmará stock.</p>
			</div>
		</Content>
	</Root>
</div>