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

	// --- LÓGICA ETIQUETAS ---
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
	<div class="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" on:click={cerrarZoom}>
		<div class="relative w-full max-w-lg bg-white rounded-xl overflow-hidden p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
			<button class="absolute top-2 right-2 z-10 bg-gray-100 hover:bg-red-100 rounded-full p-2" on:click={cerrarZoom}>✕</button>
			<img src={foto} alt="" class="w-full h-auto object-contain max-h-[80vh]" />
			<div class="text-center mt-3 font-bold text-lg text-gray-800">{formatearTexto(product.name)}</div>
			<div class="text-center text-sm text-[#FF6600] font-bold">Bs. {precioDisplay}</div>
		</div>
	</div>
{/if}

{#if product}
	<a href="/product-{product.slug || product.$id}" class="flex flex-col bg-white border border-gray-200 rounded-[10px] overflow-hidden hover:border-[#FF6600] hover:shadow-xl transition-all duration-300 relative group no-underline h-full">

		{#if esOfertaRelampago}
			<div class="absolute top-2 left-2 bg-[#FF0033] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] z-10 shadow-sm animate-pulse">
				¡Oferta!
			</div>
		{/if}

		<div
			class="relative w-full aspect-square bg-white cursor-zoom-in overflow-hidden border-b border-gray-50"
			on:click={abrirZoom}
		>
			{#if foto}
				<img
					src={foto}
					alt=""
					class="absolute inset-0 w-full h-full object-contain p-1 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
					loading="lazy"
				/>
			{:else}
				<div class="absolute inset-0 flex items-center justify-center text-gray-200">
					<svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
				</div>
			{/if}
		</div>

		<div class="p-3 flex flex-col flex-1">

			<h3 class="text-[13px] text-[#222] leading-snug line-clamp-2 font-medium hover:text-[#FF6600] mb-0.5 min-h-[2.5em]">
				{formatearTexto(product.name || product.descripcion)}
			</h3>

			<div class="h-4 mb-2 relative overflow-hidden">
				{#key indexEtiqueta}
					<div
						class={`absolute top-0 left-0 text-[8px] font-bold px-1.5 py-0.5 rounded border ${etiquetas[indexEtiqueta].color} inline-block whitespace-nowrap`}
						transition:fade={{ duration: 300 }}
					>
						{etiquetas[indexEtiqueta].text}
					</div>
				{/key}
			</div>

			<div class="mt-auto border-t border-dashed border-gray-100 pt-1.5 mb-2">

				<div class="flex items-end justify-between mb-1">
					<div class="flex flex-col">
						<span class="text-[9px] text-gray-400 font-medium leading-none mb-0.5">Precio Unitario</span>
						<div class="flex items-baseline gap-0.5">
							<span class="text-[12px] font-bold text-[#FF6600]">Bs</span>
							<span class="text-[20px] font-[900] text-[#222] leading-none">{precioDisplay}</span>
						</div>
					</div>

					<div class="text-right flex flex-col items-end">
						<span class="text-[9px] text-gray-400">Ref: {product.codigo || 'S/N'}</span>
						<span class="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 rounded mt-0.5">x {minQty} Unid.</span>
					</div>
				</div>

				<div class="flex items-center justify-between bg-orange-50 px-2 py-1 rounded-[4px] border border-orange-100 mt-1">
					<span class="text-[10px] text-orange-600 font-bold uppercase">Total Compra:</span>
					<span class="text-[12px] font-black text-orange-700">Bs. {inversionTotal}</span>
				</div>

			</div>

			<div
				class="w-full bg-[#FF6600] hover:bg-[#e05a00] text-white rounded-full py-2 text-center cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2 font-bold text-[12px] shadow-sm shadow-orange-200"
				on:click={comprarWhatsApp}
			>
				<i class="bi bi-whatsapp text-[14px]"></i>
				Cotizar Ahora
			</div>

		</div>
	</a>
{/if}