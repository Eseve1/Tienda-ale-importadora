<script>
	import { fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	export let product = {};

	// Datos seguros (Blindaje)
	$: pMayor = parseFloat(product?.preciopormayor || product?.price || 0);
	$: precioDisplay = pMayor.toFixed(2);
	$: minQty = product?.moq || 3;
	$: estaAgotado = product?.disponible === false || product?.stock === 0;

	// Imágenes
	function optimizar(url) {
		if (!url) return '/placeholder.png';
		if (url.includes('cloud.appwrite.io')) {
			let newUrl = url.replace('/view', '/preview');
			const separator = newUrl.includes('?') ? '&' : '?';
			return `${newUrl}${separator}width=400&quality=80&output=webp`;
		}
		return url;
	}

	$: mainImage = optimizar(product?.imagen);
	$: secondImage = product?.imagen2 ? optimizar(product.imagen2) : null;

	// --- LÓGICA DE ANIMACIÓN ---
	let indexEtiqueta = 0;
	let intervalo;

	const etiquetas = [
		{ text: "Stock Verificado", icon: "✅", color: "text-green-600" },
		{ text: "Envíos a todo Bolivia", icon: "📦", color: "text-blue-600" },
		{ text: "Envío Inmediato", icon: "⚡", color: "text-amber-600" },
		{ text: "Alta Rotación", icon: "🔥", color: "text-orange-600" }
	];

	onMount(() => {
		intervalo = setInterval(() => {
			indexEtiqueta = (indexEtiqueta + 1) % etiquetas.length;
		}, 3000); // Cambia cada 3 segundos
	});

	onDestroy(() => { if (intervalo) clearInterval(intervalo); });
</script>

<div class="flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative group h-full border border-gray-100 {estaAgotado ? 'opacity-70' : ''}">

	<div class="relative w-full aspect-square bg-white overflow-hidden">
		<img src={mainImage} alt="" class="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 {secondImage && !estaAgotado ? 'group-hover:opacity-0' : 'group-hover:scale-105'} {estaAgotado ? 'grayscale' : ''}" loading="lazy" />
		{#if secondImage && !estaAgotado}
			<img src={secondImage} alt="" class="absolute inset-0 w-full h-full object-contain p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
		{/if}
		{#if estaAgotado}
			<div class="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
				<span class="bg-gray-800 text-white px-3 py-1 font-bold text-[10px] uppercase rounded-full">Agotado</span>
			</div>
		{/if}
	</div>

	<div class="p-3 flex flex-col flex-1">
		<h3 class="text-[13px] font-normal text-gray-700 leading-tight line-clamp-2 mb-2 h-[34px]" title={product?.descripcion}>
			{product?.descripcion || 'Cargando...'}
		</h3>

		<div class="mb-2">
			<div class="flex items-baseline text-[#FF4500]">
				<span class="text-xs font-bold mr-1">Bs.</span>
				<span class="text-2xl font-bold leading-none tracking-tight">{precioDisplay}</span>
			</div>
			<p class="text-[11px] text-gray-500 mt-1">Cantidad mínima: {minQty} unidades</p>
		</div>

		<div class="h-6 mb-3 relative overflow-hidden flex items-center">
			{#if !estaAgotado}
				{#key indexEtiqueta}
					<div class="absolute inset-0 flex items-center gap-1.5"
							 in:fly={{ y: 20, duration: 500 }}
							 out:fly={{ y: -20, duration: 500 }}>
						<span class="text-[12px]">{etiquetas[indexEtiqueta].icon}</span>
						<span class="text-[10px] font-bold {etiquetas[indexEtiqueta].color} uppercase tracking-tight">
                            {etiquetas[indexEtiqueta].text}
                        </span>
					</div>
				{/key}
			{:else}
				<div class="flex items-center gap-1 text-[10px] font-bold text-gray-400">
					<span>🚫</span> Sin Stock
				</div>
			{/if}
		</div>

		<div class="mt-auto pt-2 border-t border-gray-50">
			<button class="w-full bg-white text-[#25D366] border border-[#25D366] group-hover:bg-[#25D366] group-hover:text-white rounded py-2 font-bold text-[12px] transition-all flex items-center justify-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.792.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
				Cotizar Ahora
			</button>
			<p class="text-[9px] text-center text-gray-400 mt-2 font-medium">Minoristas solo en tienda física</p>
		</div>
	</div>
</div>