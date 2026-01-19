<script lang="ts">
	export let product: any;
	const WA = "59161333335";

	function send() {
		const msg = `Hola Ale Import, me interesa:\n📦 *${product.name}*\n🔢 REF: ${product.codigo}\n💰 Precio: Bs. ${product.price}\n¿Tienen disponibilidad?`;
		window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
	}
</script>

<div class="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm relative">
	<div class="aspect-square p-2 relative">
		<img src={product.images[0]} alt="" class="w-full h-full object-contain" />
		<div class="absolute top-2 left-2 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">REF: {product.codigo}</div>
	</div>
	<div class="p-3 flex flex-col gap-1">
		<h3 class="text-[11px] font-bold text-gray-800 leading-tight h-8 line-clamp-2 uppercase">{product.name}</h3>
		<div class="mt-1">
			<div class="flex items-baseline gap-1">
				<span class="text-[10px] font-black text-blue-700">Bs.</span>
				<span class="text-2xl font-black text-blue-700 tracking-tighter">{product.price.toFixed(0)}</span>
			</div>
			<div class="text-[9px] font-bold text-green-600 uppercase">Mínimo: {product.moq} unid.</div>
		</div>
		<button on:click|stopPropagation={send} class="mt-2 w-full bg-[#25D366] text-white py-2 rounded-lg text-[10px] font-black uppercase shadow-md">Consultar</button>
	</div>
</div>