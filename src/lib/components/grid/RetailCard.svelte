<script lang="ts">
	import { onMount } from 'svelte';
	export let product;

	$: pUnidad = parseFloat(product?.precioUnidad || 0);
	$: pOferta = (pUnidad * 0.8).toFixed(1);
	$: foto = Array.isArray(product?.images) ? product.images[0] : (product?.images || '');

	// MENSAJES CON ESTRELLAS ANIMADAS
	const mensajes = ["⭐ ¡Top Ventas! ⭐", "🔥 Vuela del estante", "⚡ Oferta Flash", "📦 Últimas unidades"];
	let index = 0;
	onMount(() => {
		const interval = setInterval(() => { index = (index + 1) % mensajes.length; }, 3000);
		return () => clearInterval(interval);
	});

	// FUNCIÓN "TIPO ORACIÓN" (Estilo Alibaba)
	function formatearTexto(texto) {
		if (!texto) return 'Producto';
		const textoLimpio = texto.trim().toLowerCase();
		return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
	}
</script>

{#if product}
	<a href="/product-{product.slug || product.$id}" class="block no-underline group h-full">
		<div class="bg-white border border-gray-100 rounded-2xl p-3 h-full flex flex-col relative transition-all hover:shadow-lg hover:border-orange-200">

			<div class="absolute top-2 left-2 z-10 bg-[#ff5000] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
				20% OFF
			</div>

			<div class="aspect-square bg-[#f8f9fa] rounded-xl overflow-hidden mb-3 flex items-center justify-center">
				{#if foto}
					<img src={foto} alt="" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
				{:else}
					<i class="bi bi-image text-3xl text-gray-300"></i>
				{/if}
			</div>

			<h3 class="text-[13px] font-bold text-[#111] line-clamp-2 leading-tight mb-2">
				{formatearTexto(product.name || product.descripcion)}
			</h3>

			<div class="mt-auto">
				<div class="flex items-baseline gap-1.5 mb-1">
					<span class="text-lg font-[1000] text-[#ff5000] tracking-tighter">Bs.{pOferta}</span>
					<span class="text-[10px] text-gray-400 line-through font-bold">Bs.{pUnidad.toFixed(1)}</span>
				</div>

				<div class="h-5 relative overflow-hidden bg-orange-50 rounded border border-orange-100">
					{#key index}
						<div class="absolute inset-0 flex items-center justify-center text-[8px] font-black text-[#ff5000] uppercase animate-slide-up tracking-wider">
							{mensajes[index]}
						</div>
					{/key}
				</div>
			</div>
		</div>
	</a>
{/if}

<style>
    @keyframes slide-up {
        0% { transform: translateY(15px); opacity: 0; }
        15% { transform: translateY(0); opacity: 1; }
        85% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-15px); opacity: 0; }
    }
    .animate-slide-up { animation: slide-up 3s infinite ease-in-out; }
</style>