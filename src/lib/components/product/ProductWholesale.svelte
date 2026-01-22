<script>
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	export let product;

	// --- 1. LÓGICA DE NEGOCIO ---
	$: pMayor = parseFloat(product?.preciopormayor || product?.price || 0);
	$: precioDisplay = pMayor.toFixed(2);
	$: minQty = product?.moq || 3;
	$: inversionTotal = (pMayor * minQty).toFixed(2);
	$: estaAgotado = product.disponible === false || product.stock === 0;

	// --- 2. IMÁGENES ---
	$: mainImage = product.imagen;
	$: secondImage = product.imagen2;

	let indexEtiqueta = 0;
	let intervalo;

	const etiquetas = [
		{ text: "📦 Envíos a toda Bolivia", icon: "", color: "text-blue-600" },
		{ text: "🚀 Envío Inmediato", icon: "⚡", color: "text-blue-600" },
		{ text: "⭐ Calidad Garantizada", icon: "⭐", color: "text-amber-600" },
		{ text: "🔥 Alta Rotación", icon: "🔥", color: "text-orange-600" },
		{ text: "✅ Stock Verificado", icon: "✅", color: "text-green-600" }
	];

	onMount(() => {
		indexEtiqueta = Math.floor(Math.random() * etiquetas.length);
		intervalo = setInterval(() => {
			indexEtiqueta = (indexEtiqueta + 1) % etiquetas.length;
		}, 5000);
	});

	onDestroy(() => { if (intervalo) clearInterval(intervalo); });

	function comprarWhatsApp(e) {
		e.preventDefault(); e.stopPropagation();
		if (estaAgotado) return;
		const nombre = (product.name || product.descripcion);

		// --- MSJ PERSONALIZADO: Jala código, cantidad y total ---
		const mensaje = `Hola AleImport! 👋 Cotización (Ref: ${product.codigo || 'S/N'}):\n\n` +
			`📌 *${nombre}*\n` +
			`📦 Cantidad mínima: *${minQty} unidades*\n` +
			`💰 Precio Unidad x Mayor: *Bs. ${precioDisplay}*\n` +
			`💵 TOTAL COMPRA: *Bs. ${inversionTotal}*\n\n` +
			`⚠️ Entiendo que este precio es exclusivo por mayor.`;

		window.open(`https://wa.me/59161333335?text=${encodeURIComponent(mensaje)}`, '_blank');
	}
</script>

{#if product}
	<div class="flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative group h-full border border-gray-100 {estaAgotado ? 'opacity-70' : ''}">

		<div class="relative w-full aspect-square bg-white overflow-hidden">
			<img src={mainImage} alt="" class="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" loading="lazy" />
			{#if estaAgotado}
				<div class="absolute inset-0 bg-white/40 flex items-center justify-center z-20">
					<span class="bg-gray-800 text-white px-3 py-1 font-bold text-[10px] uppercase rounded-full">Sin Stock</span>
				</div>
			{/if}
		</div>

		<div class="p-3 flex flex-col flex-1">
			<h3 class="text-[14px] font-normal text-[#222] leading-[18px] line-clamp-2 mb-0.5 h-[36px] font-sans">
				{product.name || product.descripcion}
			</h3>

			<div class="mb-1 flex flex-col">
				<div class="flex items-baseline text-[#ff4400]">
					<span class="text-[14px] font-bold mr-0.5">Bs.</span>
					<span class="text-[22px] font-bold leading-none tracking-tight">{precioDisplay}</span>
				</div>
				<span class="text-[11px] text-gray-500 font-normal">Cantidad mínima: {minQty} unidades</span>
			</div>

			<div class="h-6 mb-2 relative overflow-hidden flex items-center">
				{#key indexEtiqueta}
					<div class="absolute inset-0 flex items-center gap-1.5" in:fly={{ y: 15, duration: 600 }} out:fly={{ y: -15, duration: 600 }}>
					<span class="text-[10px] font-medium {etiquetas[indexEtiqueta].color}">
						{etiquetas[indexEtiqueta].icon} {etiquetas[indexEtiqueta].text}
					</span>
					</div>
				{/key}
			</div>

			<div class="mt-auto space-y-2 pt-2 border-t border-gray-50">
				<div class="flex justify-between items-center">
					<span class="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Total Compra:</span>
					<span class="text-[16px] font-bold text-gray-800 tracking-tight">Bs. {inversionTotal}</span>
				</div>

				{#if estaAgotado}
					<div class="w-full bg-gray-100 text-gray-400 rounded-lg py-2.5 text-center font-bold text-[12px] uppercase">Agotado</div>
				{:else}
					<button
						on:click={comprarWhatsApp}
						class="w-full flex items-center justify-center gap-2 bg-white text-[#25D366] border-2 border-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg py-2 transition-all duration-200 font-bold text-[13px] active:scale-95 shadow-sm"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
						Cotizar Ahora
					</button>
				{/if}
				<p class="text-[7.5px] text-center text-gray-400 font-medium leading-tight">
					Minoristas solo en tienda física
				</p>
		</div>
	</div>
{/if}

<style>
    .relative.overflow-hidden { min-height: 24px; }
</style>