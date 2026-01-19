export interface Product {
	slug: string;
	name: string;
	description: string;
	images: string[];
	category: string;
	price: number;
	precioUnidad: number;
	codigo: string;
	moq: number;
	// Nuevos campos para estilo Alibaba
	shippingPromo?: string; // Ej: "Bs. 20 de descuento en envío"
	deliveryDate?: string; // Ej: "Entrega por 27 feb"
	yearsSupplier: number; // Ej: 5
}