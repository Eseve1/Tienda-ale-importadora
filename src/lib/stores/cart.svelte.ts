import { writable } from 'svelte/store';

class CartStore {
	// 1. ESTADO (Solo en memoria RAM)
	items = $state([]);
	isOpen = $state(false);

	// 2. DERIVADOS (Cálculos automáticos)
	count = $derived(this.items.reduce((acc, item) => acc + item.quantity, 0));
	total = $derived(this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0));

	constructor() {
		// YA NO cargamos nada del localStorage. Empieza siempre vacío.
		this.items = [];
	}

	// 3. MÉTODOS
	add(product: any, variant: any = {}, quantity: number = 1) {
		const existingItem = this.items.find((item) => item.product.$id === product.$id);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			// Precio seguro
			const price = parseFloat(product.preciopormayor || product.price || 0);

			this.items.push({
				product,
				variant,
				quantity,
				price,
				slug: product.$id // Identificador único
			});
		}
		// YA NO guardamos en localStorage
	}

	remove(productId: string) {
		this.items = this.items.filter((item) => item.product.$id !== productId);
	}

	updateQuantity(productId: string, delta: number) {
		const item = this.items.find((i) => i.product.$id === productId);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				this.remove(productId);
			}
		}
	}

	clear() {
		this.items = [];
	}

	setIsOpen(value: boolean) {
		this.isOpen = value;
	}

	openCart() {
		this.isOpen = true;
	}
}

// Exportamos la instancia única
export const cart = new CartStore();