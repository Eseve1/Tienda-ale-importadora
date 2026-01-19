<script lang="ts">
	export let product: any;
	export let variant = 'default'; // 'default' (mayorista) o 'store-home'/'store-full' (unidad)

	const precioTienda = (product.price * 0.8).toFixed(1);

	// Si es oferta, el link lleva a la página de todas las ofertas
	const cardLink = variant.includes('store') ? '/ofertas' : `/product-${product.slug}`;

	const urgencyBadges = ['¡Últimas unidades!', 'Pocas unidades', 'Stock crítico'];
	const urgencyBadge = urgencyBadges[Math.floor(Math.random() * urgencyBadges.length)];
</script>

<div class="bg-white flex flex-col h-full rounded-xl overflow-hidden group border border-transparent hover:border-[#007e33]/30 hover:shadow-lg transition-all duration-300 p-2 cursor-pointer transform hover:-translate-y-1">
	<a href={cardLink} class="no-underline flex flex-col h-full">

		<div class="aspect-square bg-[#f7f7f7] rounded-lg overflow-hidden mb-2 relative flex items-center justify-center">
			<img src={product.images[0]} alt="" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
			{#if variant.includes('store')}
				<div class="absolute top-0 left-0 bg-[#007e33] text-white text-[9px] font-black px-2 py-1 rounded-br-lg uppercase">
					Santa Cruz
				</div>
			{/if}
		</div>

		<h3 class="text-[13px] text-[#222] font-normal leading-snug h-9 line-clamp-2 mb-2 sentence-case">
			{product.description || product.name}
		</h3>

		{#if variant.includes('store')}
			<div class="flex flex-col gap-1">
				<div class="border-2 border-[#ff4014] rounded-lg overflow-hidden">
					<div class="bg-[#ff4014] text-white text-[9px] font-black uppercase text-center py-0.5">Precio exclusivo en tienda</div>
					<div class="bg-[#fff5f2] p-1.5 text-center">
						<span class="text-[11px] text-gray-400 line-through">Regular: Bs. {product.price}</span>
						<div class="flex items-baseline justify-center gap-1">
							<span class="text-[24px] font-[900] text-[#ff4014]">Bs. {precioTienda}</span>
							<span class="text-[12px] font-black text-[#ff4014]">-20%</span>
						</div>
					</div>
				</div>
				<div class="mt-auto pt-1">
					<div class="inline-flex items-center justify-center w-full gap-1 text-[10px] font-bold text-[#d32f2f] bg-red-50 px-2 py-1 rounded-md animate-pulse">
						{urgencyBadge}
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col">
				<span class="text-[11px] text-gray-500 font-medium lowercase">Precio mayorista:</span>
				<span class="text-[20px] font-bold text-[#ff4014]">Bs. {product.price}</span>
				<span class="text-[11px] text-gray-400 font-medium">Mínimo: {product.moq || 12} unidades</span>
			</div>
		{/if}
	</a>
</div>

<style>
    .sentence-case::first-letter { text-transform: uppercase; }
</style>