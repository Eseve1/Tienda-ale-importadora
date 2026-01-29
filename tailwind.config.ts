module.exports = {
	content: [
		"./src/**/*.{html,svelte,ts,js}",
		"./src/**/**/*.svelte"
	],
	theme: {
		extend: {
			colors: {
				accent: "#FF6A00",
				"accent-dark": "#7a2b00",
				success: "#10B981",
				whatsapp: "#25D366"
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui"]
			}
		}
	},
	plugins: []
};