<script>
	const texto = "⚡ Despacho Inmediato • 🇧🇴 Envíos a todo Bolivia • ★ Precios de Fábrica • 📦 Venta por Cajas • 🔥 Ofertas Semanales • ";
</script>

<div class="bg-[#f7421e] text-white overflow-hidden py-3.5 relative z-50 border-b border-orange-600 shadow-sm">
	<div class="marquee-container flex whitespace-nowrap">
		<div class="animate-marquee inline-block text-xs sm:text-sm font-black tracking-widest uppercase">
			{texto} {texto} {texto} {texto}
		</div>
		<div class="animate-marquee inline-block text-xs sm:text-sm font-black tracking-widest uppercase" aria-hidden="true">
			{texto} {texto} {texto} {texto}
		</div>
	</div>
</div>

<style>
    .animate-marquee {
        animation: marquee 60s linear infinite;
        padding-right: 2rem;
    }
    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
    }
</style>
