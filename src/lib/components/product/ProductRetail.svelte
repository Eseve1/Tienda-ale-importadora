<script>
	export let product;
	$: pUnidad = parseFloat(product?.precioUnidad) || 0;
	$: pOferta = (pUnidad * 0.8).toFixed(1);
	$: foto = product?.imagen || product?.images?.[0] || '';
</script>

<div class="min-h-screen bg-white p-6 md:p-12 flex items-center justify-center font-sans">
	<div class="max-w-2xl w-full mx-auto flex flex-col gap-8">

		<h1 class="text-3xl md:text-5xl font-[1000] text-[#111] leading-tight text-center tracking-tighter italic uppercase">
			{product.name || product.descripcion}
		</h1>

		<div class="bg-[#fff5f0] border-2 border-[#ff5000] p-10 rounded-[40px] text-center shadow-md transform hover:scale-[1.01] transition-transform">

			<span class="text-[#ff5000] text-[11px] font-black uppercase block mb-3 tracking-widest">
				Oferta exclusiva tienda
			</span>

			<div class="flex items-baseline justify-center gap-4">
				<span class="text-6xl md:text-8xl font-[1000] text-[#ff5000] tracking-tighter leading-none">
					Bs. {pOferta}
				</span>
				<span class="text-xl text-gray-400 line-through font-bold">
					Bs. {pUnidad.toFixed(1)}
				</span>
			</div>

			<p class="text-xs font-bold text-gray-500 mt-4 uppercase italic">
				Pedido mín: 1 unidad
			</p>

			<button class="mt-6 bg-[#ff5000] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:bg-[#ff6600] transition-colors w-full md:w-auto">
				¡Lo quiero ya!
			</button>
		</div>

		{#if foto}
			<div class="aspect-square bg-gray-50 rounded-[40px] overflow-hidden flex items-center justify-center border border-gray-100 p-8">
				<img src={foto} alt="" class="w-full h-full object-contain mix-blend-multiply" />
			</div>
		{/if}

		<div class="text-center">
			<a href="/" class="text-gray-400 font-bold text-xs underline hover:text-[#ff5000] uppercase">
				Volver al inicio
			</a>
		</div>
	</div>
</div>