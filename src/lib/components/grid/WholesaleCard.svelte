<script>
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	export let product;

	// DATOS
	$: pMayor = parseFloat(product?.preciopormayor || product?.price || 0);
	$: precioDisplay = pMayor.toFixed(2);
	$: esOfertaRelampago = pMayor <= 10;
	$: foto = Array.isArray(product?.images) ? product.images[0] : (product?.images || '');
	$: minQty = product?.moq || 3;

	// CÁLCULO AUTOMÁTICO DEL TOTAL
	$: inversionTotal = (pMayor * minQty).toFixed(2);

	let mostrarZoom = false;

	// ETIQUETAS
	const etiquetas = [
		{ text: "🚀 Envío Inmediato", color: "bg-blue-50 text-blue-700 border-blue-100" },
		{ text: "⭐ Calidad Top", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
		{ text: "🔥 Alta Rotación", color: "bg-orange-50 text-orange-700 border-orange-100" },
		{ text: "✅ Stock Verificado", color: "bg-green-50 text-green-700 border-green-100" }
	];

	let indexEtiqueta = 0;
	let intervalo;

	onMount(() => {
		indexEtiqueta = Math.floor(Math.random() * etiquetas.length);
		intervalo = setInterval(() => {
			indexEtiqueta = (indexEtiqueta + 1) % etiquetas.length;
		}, 3500);
	});

	onDestroy(() => {
		if (intervalo) clearInterval(intervalo);
	});

	function formatearTexto(texto) {
		if (!texto) return 'Producto';
		const textoLimpio = texto.trim().toLowerCase();
		return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
	}

	function comprarWhatsApp(e) {
		e.preventDefault(); e.stopPropagation();
		const nombre = formatearTexto(product.name || product.descripcion);
		const mensaje = `Hola AleImport! 👋 Cotización (Ref: ${product.codigo || 'S/N'}):\n\n📌 *${nombre}*\n📦 Cantidad: *${minQty} unidades*\n💰 Precio Unitario: *Bs. ${precioDisplay}*\n💵 Total Compra: *Bs. ${inversionTotal}*\n\n¿Disponibilidad inmediata?`;
		const numero = "59161333335";
		const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
		window.open(url, '_blank');
	}

	function abrirZoom(e) {
		e.preventDefault(); e.stopPropagation();
		mostrarZoom = true;
	}
	function cerrarZoom(e) {
		if(e) e.stopPropagation();
		mostrarZoom = false;
	}
</script>

{#if mostrarZoom}
	<div class="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" on:click={cerrarZoom} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && cerrarZoom()}>
		<div class="relative w-full max-w-lg bg-white rounded-xl overflow-hidden p-2 shadow-2xl animate-in fade-in zoom-in duration-200" role="dialog">
			<button class="absolute top-2 right-2 z-10 bg-gray-100 hover:bg-red-100 rounded-full p-2" on:click={cerrarZoom} aria-label="Cerrar zoom">✕</button>
			<img src={foto} alt="" class="w-full h-auto object-contain max-h-[80vh]" />
			<div class="text-center mt-3 font-bold text-lg text-gray-800">{formatearTexto(product.name || product.descripcion)}</div>
			<div class="text-center text-sm text-[#FF6600] font-bold">Bs. {precioDisplay}</div>
		</div>
	</div>
{/if}

{#if product}
	<a href="/product-{product.slug || product.$id}" class="flex flex-col bg-white border border-gray-100 rounded-[12px] overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-300 relative group no-underline h-full">

		{#if esOfertaRelampago}
			<div class="absolute top-2 left-2 bg-[#FF0033] text-white text-[9px] font-bold px-2 py-0.5 rounded-[4px] z-10 shadow-sm animate-pulse">
				¡Oferta!
			</div>
		{/if}

		<div class="relative w-full aspect-square bg-white cursor-zoom-in overflow-hidden border-b border-gray-50" on:click={abrirZoom} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && abrirZoom(e)}>
			{#if foto}
				<img src={foto} alt="" class="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
			{:else}
				<div class="absolute inset-0 flex items-center justify-center text-gray-200">
					<svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
				</div>
			{/if}
		</div>

		<div class="p-3 flex flex-col flex-1">
			<h3 class="text-[13px] text-gray-700 leading-snug line-clamp-2 font-semibold hover:text-[#FF6600] mb-1 min-h-[2.5em]">
				{formatearTexto(product.name || product.descripcion)}
			</h3>

			<div class="h-6 mb-1 relative overflow-hidden flex items-center">
				{#key indexEtiqueta}
					<div
						class={`absolute top-0 left-0 text-[9px] font-bold px-2 py-0.5 rounded border ${etiquetas[indexEtiqueta].color} inline-block whitespace-nowrap shadow-sm`}
						transition:fade={{ duration: 300 }}
					>
						{etiquetas[indexEtiqueta].text}
					</div>
				{/key}
			</div>

			<div class="mt-auto border-t border-dashed border-gray-100 pt-2 mb-2">
				<div class="flex items-end justify-between mb-1">
					<div class="flex flex-col">
						<span class="text-[9px] text-gray-400 font-medium leading-none mb-0.5">Precio Unitario</span>
						<div class="flex items-baseline gap-0.5">
							<span class="text-[11px] font-bold text-gray-500">Bs</span>
							<span class="text-[18px] font-bold text-gray-900 leading-none">{precioDisplay}</span>
						</div>
					</div>
					<div class="text-right flex flex-col items-end">
						<span class="text-[9px] text-gray-400">Ref: {product.codigo || 'S/N'}</span>
						<span class="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 rounded mt-0.5 border border-gray-100">Mín: {minQty} Uds.</span>
					</div>
				</div>
				<div class="flex items-center justify-between bg-gray-50 px-2 py-1 rounded-[4px] border border-gray-200 mt-1">
					<span class="text-[10px] text-gray-500 font-bold uppercase">Total Caja:</span>
					<span class="text-[12px] font-black text-[#FF6600]">Bs. {inversionTotal}</span>
				</div>
			</div>

			<div
				class="w-full bg-white hover:bg-[#FF6600] text-[#FF6600] hover:text-white border border-[#FF6600] rounded-lg py-1.5 text-center cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-2 font-bold text-[12px]"
				on:click={comprarWhatsApp}
				role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && comprarWhatsApp(e)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
				Cotizar Ahora
			</div>
		</div>
	</a>
{/if}