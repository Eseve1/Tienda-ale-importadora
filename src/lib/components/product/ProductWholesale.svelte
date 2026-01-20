<script>
	export let product;
</script>

<div class="bg-white border border-gray-200 rounded-lg hover:shadow-xl hover:border-orange-300 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">

	<div class="relative w-full aspect-square bg-white p-4 overflow-hidden">
		<img
			src={product.imagen}
			alt={product.descripcion}
			class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
		>
		{#if !product.disponible}
			<div class="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
				<span class="bg-gray-800 text-white text-[10px] px-2 py-1 font-bold uppercase rounded">Agotado</span>
			</div>
		{/if}
	</div>

	<div class="p-3 flex flex-col flex-1 border-t border-gray-100">

		<h3 class="text-[13px] text-gray-700 font-medium leading-snug line-clamp-2 mb-2 h-[34px] group-hover:text-[#FF6600] transition-colors">
			{product.descripcion}
		</h3>

		<div class="mt-auto">
			<div class="flex items-baseline gap-1">
				<span class="text-lg font-black text-gray-900">Bs {product.preciopormayor}</span>
				<span class="text-[10px] text-gray-400 font-normal">/unidad</span>
			</div>

			<div class="flex justify-between items-center mt-1">
        <span class="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          Min: {product.moq} pzs
        </span>
				{#if product.precioUnidad}
					<span class="text-[10px] text-gray-400 line-through">Bs {product.precioUnidad}</span>
				{/if}
			</div>
		</div>

		<div class="mt-3 pt-2 border-t border-dashed border-gray-200">
			<button class="w-full py-1.5 rounded border border-[#FF6600] text-[#FF6600] text-xs font-bold uppercase hover:bg-[#FF6600] hover:text-white transition-colors flex items-center justify-center gap-2">
				<i class="bi bi-chat-text-fill"></i>
				Contactar
			</button>
		</div>
	</div>
</div>