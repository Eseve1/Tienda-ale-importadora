<script>
	// El texto que pediste
	const texto = "🚚 ENVÍOS A TODO BOLIVIA SEGUROS • ⚡ DESCUENTO DEL 20% APLICADO EN PRECIOS POR MAYOR • 📦 PEDIDO MÍNIMO BS. 300 • 🔥 OFERTAS RELÁMPAGO ACTIVAS • ";
</script>

<div class="bg-[#111827] text-white overflow-hidden py-1.5 relative z-50 border-b border-gray-800">
	<div class="marquee-container flex whitespace-nowrap">
		<div class="animate-marquee inline-block text-[10px] sm:text-xs font-bold tracking-wider uppercase">
			{texto} {texto} {texto} {texto}
		</div>
		<div class="animate-marquee inline-block text-[10px] sm:text-xs font-bold tracking-wider uppercase" aria-hidden="true">
			{texto} {texto} {texto} {texto}
		</div>
	</div>
</div>

<style>
    /* Animación suave y continua */
    .animate-marquee {
        animation: marquee 30s linear infinite;
        padding-right: 1rem; /* Espacio entre bloques */
    }

    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
    }
</style>