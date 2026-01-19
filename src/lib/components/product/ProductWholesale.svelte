<script lang="ts">
	export let product;

	// FUNCIÓN DE FORMATO DENTRO DE LA TARJETA
	function formatearTexto(texto) {
		if (!texto) return 'Producto sin nombre';
		// 1. Quitar espacios extra
		// 2. Convertir todo a minúscula
		// 3. Poner la primera letra en mayúscula
		const textoLimpio = texto.trim().toLowerCase();
		return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
	}

	const foto = product.imagen || product.images?.[0] || '';
</script>

<a href="/product-{product.$id}" class="bg-white rounded-[20px] border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col no-underline h-full">

	<div class="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
		{#if foto}
			<img
				src={foto}
				alt={product.descripcion}
				class="absolute top-0 left-0 w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
				loading="lazy"
			/>
		{:else}
			<div class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-300">
				<i class="bi bi-image text-3xl"></i>
			</div>
		{/if}
	</div>

	<div class="p-3 flex flex-col flex-1">

		<h3 class="font-bold text-gray-800 text-xs md:text-sm leading-tight mb-1 line-clamp-2">
			{formatearTexto(product.descripcion)}
		</h3>

		<p class="text-[10px] text-gray-400 font-bold mb-3">REF: {product.codigo}</p>

		<div class="mt-auto">
			<span class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Por Mayor</span>
			<div class="flex items-baseline gap-1">
				<span class="text-sm font-bold text-[#CC0000]">Bs.</span>
				<span class="text-xl font-[1000] text-[#CC0000] tracking-tight">{product.preciopormayor}</span>
			</div>

			{#if product.moq}
				<div class="mt-1 inline-block bg-gray-100 px-2 py-1 rounded text-[9px] font-bold text-gray-500">
					Mínimo: {product.moq} u.
				</div>
			{/if}
		</div>
	</div>
</a>