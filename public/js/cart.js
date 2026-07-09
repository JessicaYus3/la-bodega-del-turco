const CART_KEY = 'bodega_turco_cart';

const Cart = {
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
  },

  addItem(producto, cantidad) {
    const items = this.getItems();
    const existing = items.find((i) => i.id === producto.id);

    if (existing) {
      existing.cantidad += cantidad;
    } else {
      items.push({
        id: producto.id,
        numero: producto.numero,
        nombre: producto.nombre,
        precioUnidad: producto.precioUnidad,
        precioMayor: producto.precioMayor,
        cantidad
      });
    }

    this.saveItems(items);
  },

  removeItem(id) {
    const items = this.getItems().filter((i) => i.id !== id);
    this.saveItems(items);
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    this.updateBadge();
  },

  getTotalItems() {
    return this.getItems().reduce((sum, i) => sum + i.cantidad, 0);
  },

  getPrecio(item) {
    return item.cantidad > 6 ? item.precioMayor : item.precioUnidad;
  },

  getSubtotal(item) {
    return this.getPrecio(item) * item.cantidad;
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + this.getSubtotal(i), 0);
  },

  updateBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) {
      badge.textContent = this.getTotalItems();
    }
  },

  formatPrecio(valor) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  },

  buildWhatsAppMessage() {
    const items = this.getItems();
    if (items.length === 0) return '';

    let msg = '¡Hola! Me interesan los siguientes productos de *La Bodega del Turco*:\n\n';

    items.forEach((item, index) => {
      const tipo = item.cantidad > 6 ? 'Por Mayor' : 'Al Detalle';
      const precio = this.getPrecio(item);
      msg += `${index + 1}. *${item.nombre}* (${item.numero})\n`;
      msg += `   Cantidad: ${item.cantidad} | Tipo: ${tipo}\n`;
      msg += `   Precio unitario: ${this.formatPrecio(precio)}\n`;
      msg += `   Subtotal: ${this.formatPrecio(this.getSubtotal(item))}\n\n`;
    });

    msg += `*Total estimado: ${this.formatPrecio(this.getTotal())}*\n\n`;
    msg += '¿Podrían darme más información sobre disponibilidad?';

    return msg;
  }
};
