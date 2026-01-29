import { writable } from 'svelte/store';

function createCart() {
	// EL CAMBIO CLAVE: "as any[]" para que TS no moleste
	const { subscribe, set, update } = writable({
		items: [] as any[],
		isOpen: false,
		total: 0,
		count: 0
	});

	let timer: any;

	return {
		subscribe,
		setIsOpen: (val: boolean) => {
			if (val) clearTimeout(timer);
			update(s => ({ ...s, isOpen: val }));
		},

		add: (product: any, quantity: number) => {
			update((state) => {
				// Comparación segura de IDs
				const pId = product.$id || product.id || product.codigo;
				const existingIndex = state.items.findIndex((i) => {
					const iId = i.product.$id || i.product.id || i.product.codigo;
					return iId === pId;
				});

				let newItems = [...state.items];
				// Asegurar que precio sea número
				const price = Number(product.preciopormayor || product.price || 0);

				if (existingIndex >= 0) {
					newItems[existingIndex].quantity += quantity;
				} else {
					newItems.push({
						product,
						quantity,
						price
					});
				}

				const total = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
				const count = newItems.reduce((acc, item) => acc + item.quantity, 0);

				return { items: newItems, total, count, isOpen: true };
			});

			// Auto-cierre a los 3 seg
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				update(s => ({ ...s, isOpen: false }));
			}, 3000);
		},

		updateQuantity: (productId: string, delta: number) => {
			update((state) => {
				const newItems = state.items.map(item => {
					const iId = item.product.$id || item.product.id || item.product.codigo;
					if (iId === productId) {
						const newQty = Math.max(1, item.quantity + delta);
						return { ...item, quantity: newQty };
					}
					return item;
				});
				// Recalcular totales
				const total = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
				const count = newItems.reduce((acc, item) => acc + item.quantity, 0);
				return { ...state, items: newItems, total, count };
			});
		},

		clear: () => {
			set({ items: [], isOpen: false, total: 0, count: 0 });
		},

		openCart: () => {
			update(s => ({ ...s, isOpen: true }));
		}
	};
}

export const cart = createCart();