let generoActivo = 'todos';
let lineaActiva = 'todos';
let busquedaActiva = '';

function leerParamsUrl() {
  const params = new URLSearchParams(window.location.search);
  generoActivo = params.get('genero') || 'todos';
  busquedaActiva = (params.get('q') || '').trim().toLowerCase();

  if (params.get('linea') === 'infantil') {
    lineaActiva = 'infantil';
  } else if (params.get('subcategoria')) {
    lineaActiva = params.get('subcategoria');
  } else {
    lineaActiva = 'todos';
  }
}

function actualizarUrl() {
  const params = new URLSearchParams();
  if (lineaActiva === 'infantil') {
    params.set('linea', 'infantil');
  } else if (lineaActiva !== 'todos') {
    params.set('subcategoria', lineaActiva);
  }
  if (generoActivo !== 'todos') params.set('genero', generoActivo);
  if (busquedaActiva) params.set('q', busquedaActiva);
  const qs = params.toString();
  const url = qs ? `/productos.html?${qs}` : '/productos.html';
  window.history.replaceState({}, '', url);
}

function filtrarPorBusqueda(productos) {
  if (!busquedaActiva) return productos;
  return productos.filter((p) => {
    const texto = [p.nombre, p.numero, p.descripcion, p.subcategoria, p.genero]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return texto.includes(busquedaActiva);
  });
}

function actualizarFiltroTexto() {
  const el = document.getElementById('filtroActivo');
  if (!el) return;

  const partes = [];
  if (lineaActiva !== 'todos') {
    partes.push(`<strong>${LINEAS[lineaActiva] || SUBCATEGORIAS[lineaActiva] || lineaActiva}</strong>`);
  }
  if (generoActivo !== 'todos') {
    partes.push(`<strong>${GENEROS[generoActivo]}</strong>`);
  }
  if (busquedaActiva) {
    partes.push(`búsqueda: <strong>"${busquedaActiva}"</strong>`);
  }

  el.innerHTML = partes.length === 0
    ? 'Mostrando todos los productos'
    : `Filtrando por ${partes.join(' · ')}`;
}

function sincronizarFiltrosUI() {
  document.querySelectorAll('[data-filtro-linea]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filtroLinea === lineaActiva);
  });
  actualizarFiltroTexto();
}

function aplicarFiltroLinea(valor) {
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
    const params = new URLSearchParams();
    if (lineaActiva === 'infantil') {
      params.set('linea', 'infantil');
    } else if (lineaActiva !== 'todos') {
      params.set('subcategoria', lineaActiva);
    }
    if (generoActivo !== 'todos') params.set('genero', generoActivo);

    const qs = params.toString();
    const url = qs ? `/api/productos?${qs}` : '/api/productos';
    const res = await fetch(url);
    let productos = await res.json();
    productos = filtrarPorBusqueda(productos);

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
    btn.addEventListener('click', () => aplicarFiltroLinea(btn.dataset.filtroLinea));
  });
});
