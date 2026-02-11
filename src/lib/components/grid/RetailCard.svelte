<script lang="ts">
	export let product: any;
</script>

<div
	class="group relative bg-white rounded-xl border border-gray-200 flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden font-sans h-full { !product.disponible ? 'opacity-60' : '' }"
>
	{#if !product.disponible}
		<div class="absolute top-0 right-0 z-20 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
			Agotado
		</div>
	{/if}

	<div class="aspect-square w-full relative bg-[#f8f8f8]">
		<img
			src="{product.imagen}&width=400&height=400&quality=75&output=webp"
			alt={product.descripcion}
			loading="lazy"
			width="400"
			height="400"
			class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 { !product.disponible ? 'grayscale' : '' }"
		/>
	</div>

	<div class="p-2 flex flex-col flex-1">
		<div class="mb-1.5">
			<h3 class="font-sans font-medium text-[#222] text-[11px] leading-3 line-clamp-2 h-[24px] mb-0.5 capitalize">
				{product.descripcion.toLowerCase()}
			</h3>

			<div class="flex items-baseline gap-0.5 text-[#222]">
				<span class="text-[10px] font-bold">Bs.</span>
				<span class="font-sans font-black text-base leading-none">
					{Number(product.precioUnidad).toFixed(2)}
				</span>
			</div>
		</div>

		<div class="text-[11px] text-[#222] font-medium font-sans leading-tight">
			Solo en tienda física
		</div>
	</div>
</div>
