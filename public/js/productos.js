let lineaActiva = 'todos';

function leerParamsUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('linea') === 'infantil') {
    lineaActiva = 'infantil';
  } else if (params.get('subcategoria')) {
    lineaActiva = params.get('subcategoria');
  } else {
    lineaActiva = 'todos';
  }
}

function actualizarUrl() {
  const url = productosPageUrl(null, null, lineaActiva);
  window.history.replaceState({}, '', url);
}

function actualizarFiltroTexto() {
  const el = document.getElementById('filtroActivo');
  if (!el) return;

  if (lineaActiva === 'todos') {
    el.innerHTML = 'Mostrando todos los productos';
  } else {
    const label = LINEAS[lineaActiva] || SUBCATEGORIAS[lineaActiva] || lineaActiva;
    el.innerHTML = `Filtrando por <strong>${label}</strong>`;
  }
}

function sincronizarFiltrosUI() {
  document.querySelectorAll('[data-filtro-linea]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filtroLinea === lineaActiva);
  });
  actualizarFiltroTexto();
}

function aplicarFiltro(valor) {
  lineaActiva = valor;
  sincronizarFiltrosUI();
  actualizarUrl();
  cargarProductos();
}

async function cargarProductos() {
  const grid = document.getElementById('productosGrid');
  const countEl = document.getElementById('resultCount');
  grid.innerHTML = '<p class="loading">Cargando productos...</p>';

  try {
    const res = await fetch(buildProductosUrl(null, null, lineaActiva));
    const productos = await res.json();

    if (productos.length === 0) {
      grid.innerHTML = '<p class="empty-state">No hay productos en esta categoría.</p>';
      countEl.textContent = '';
      return;
    }

    countEl.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
    grid.innerHTML = productos.map(renderProducto).join('');
    bindProductoEvents();
  } catch (err) {
    grid.innerHTML = '<p class="empty-state">Error al cargar productos.</p>';
    countEl.textContent = '';
    console.error(err);
  }
}

function initCartModal() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;

  document.getElementById('cartBtn').addEventListener('click', () => {
    renderCarrito();
    modal.classList.add('active');
  });

  document.getElementById('closeCart').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.getElementById('whatsappBtn').addEventListener('click', () => {
    const msg = Cart.buildWhatsAppMessage();
    if (msg && window.siteConfig?.whatsapp) {
      window.open(`https://wa.me/${window.siteConfig.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  });

  document.getElementById('clearCart').addEventListener('click', () => {
    Cart.clear();
    renderCarrito();
  });
}

function renderCarrito() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const waBtn = document.getElementById('whatsappBtn');
  const items = Cart.getItems();

  if (items.length === 0) {
    container.innerHTML = '<p class="cart-empty">Aún no has seleccionado productos.</p>';
    totalEl.textContent = '';
    waBtn.disabled = true;
    return;
  }

  container.innerHTML = items.map((item) => {
    const tipo = item.cantidad > 6 ? 'Por mayor' : 'Detalle';
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.nombre}</h4>
          <p>${item.numero} · ${item.cantidad} uds. · ${tipo}</p>
        </div>
        <span class="cart-item-price">${Cart.formatPrecio(Cart.getSubtotal(item))}</span>
        <button class="cart-item-remove" data-id="${item.id}" title="Eliminar">&times;</button>
      </div>
    `;
  }).join('');

  totalEl.textContent = `Total estimado: ${Cart.formatPrecio(Cart.getTotal())}`;
  waBtn.disabled = false;

  container.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      Cart.removeItem(btn.dataset.id);
      renderCarrito();
    });
  });
}

async function cargarConfig() {
  try {
    const res = await fetch('/api/config');
    window.siteConfig = await res.json();
  } catch (err) {
    console.error('Error cargando configuración:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  leerParamsUrl();
  cargarConfig();
  sincronizarFiltrosUI();
  cargarProductos();
  Cart.updateBadge();
  initCartModal();

  document.querySelectorAll('[data-filtro-linea]').forEach((btn) => {
    btn.addEventListener('click', () => aplicarFiltro(btn.dataset.filtroLinea));
  });
});
