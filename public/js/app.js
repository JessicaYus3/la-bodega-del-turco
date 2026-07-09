let config = {};

async function cargarConfig() {
  try {
    const res = await fetch('/api/config');
    config = await res.json();

    document.getElementById('contactoTelefono').textContent = config.telefono || 'No disponible';
    document.getElementById('contactoDireccion').textContent = config.direccion || 'No disponible';
    document.getElementById('contactoHorario').textContent = config.horario || 'No disponible';

    const msg = encodeURIComponent('¡Hola! Me gustaría obtener más información sobre sus productos.');
    const waUrl = config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${msg}` : '#';

    document.getElementById('contactoWhatsapp').href = waUrl;
    document.getElementById('ctaWhatsapp').href = waUrl;
  } catch (err) {
    console.error('Error cargando configuración:', err);
  }
}

function irAProductos(genero, subcategoria) {
  window.location.href = productosPageUrl(genero, subcategoria);
}

async function cargarProductosPreview() {
  const grid = document.getElementById('productosGrid');
  const countEl = document.getElementById('resultCount');
  const verTodosEl = document.getElementById('verTodosLink');
  grid.innerHTML = '<p class="loading">Cargando productos...</p>';

  try {
    const res = await fetch('/api/productos');
    const productos = await res.json();

    if (productos.length === 0) {
      grid.innerHTML = '<p class="empty-state">No hay productos disponibles.</p>';
      countEl.textContent = '';
      if (verTodosEl) verTodosEl.style.display = 'none';
      return;
    }

    const limit = getHomeProductLimit();
    const preview = productos.slice(0, limit);
    const restantes = productos.length - preview.length;

    countEl.textContent = restantes > 0
      ? `Mostrando ${preview.length} de ${productos.length} productos`
      : `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;

    grid.innerHTML = preview.map(renderProducto).join('');
    bindProductoEvents();

    if (verTodosEl) {
      verTodosEl.style.display = restantes > 0 ? 'inline-flex' : 'none';
      verTodosEl.textContent = `Ver todos los productos (${productos.length})`;
      verTodosEl.href = '/productos.html';
    }
  } catch (err) {
    grid.innerHTML = '<p class="empty-state">Error al cargar productos.</p>';
    countEl.textContent = '';
    console.error(err);
  }
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

function initCarousel() {
  const track = document.getElementById('generoCarousel');
  const prev = document.getElementById('carouselPrev');
  const next = document.getElementById('carouselNext');

  if (!track) return;

  const scrollAmount = () => track.clientWidth * 0.75;

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarConfig();
  cargarProductosPreview();
  Cart.updateBadge();
  initCarousel();

  document.querySelectorAll('#circlesSub .circle-cat').forEach((btn) => {
    btn.addEventListener('click', () => {
      irAProductos('todos', btn.dataset.sub);
    });
  });

  document.querySelectorAll('#generoCarousel .genre-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      irAProductos(btn.dataset.genero, 'todos');
    });
  });

  const modal = document.getElementById('cartModal');
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
    if (msg && config.whatsapp) {
      window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  });

  document.getElementById('clearCart').addEventListener('click', () => {
    Cart.clear();
    renderCarrito();
  });
});
