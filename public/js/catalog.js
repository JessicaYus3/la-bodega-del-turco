const HOME_PREVIEW_ROWS = 2;

function getColumnCount() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 3;
  return 2;
}

function getHomePreviewLimit() {
  return getColumnCount() * HOME_PREVIEW_ROWS;
}

function buildProductosApiUrl(genero = 'todos', sub = 'todos') {
  const params = new URLSearchParams();
  if (genero !== 'todos') params.set('genero', genero);
  if (sub !== 'todos') params.set('subcategoria', sub);
  const qs = params.toString();
  return qs ? `/api/productos?${qs}` : '/api/productos';
}

function buildProductosPageUrl(genero = 'todos', sub = 'todos') {
  const params = new URLSearchParams();
  if (genero !== 'todos') params.set('genero', genero);
  if (sub !== 'todos') params.set('subcategoria', sub);
  const qs = params.toString();
  return qs ? `/productos.html?${qs}` : '/productos.html';
}

function renderProducto(p) {
  const imgContent = p.imagen
    ? `<img src="${p.imagen}" alt="${p.nombre}" onerror="this.parentElement.innerHTML='<span class=producto-img-placeholder>Sin imagen</span>'">`
    : '<span class="producto-img-placeholder">Sin imagen</span>';

  return `
    <article class="producto-card" data-id="${p.id}">
      <div class="producto-img">${imgContent}</div>
      <div class="producto-body">
        <h3 class="producto-nombre">${p.nombre}</h3>
        <p class="producto-precio-linea">
          <span>${Cart.formatPrecio(p.precioUnidad)}</span>
          <span class="precio-mayor-tag">Mayor ${Cart.formatPrecio(p.precioMayor)}</span>
        </p>
        <p class="producto-ref">${p.numero}</p>
        <div class="producto-actions">
          <div class="qty-control">
            <button class="qty-btn qty-minus" data-id="${p.id}" aria-label="Menos">−</button>
            <input type="number" class="qty-input" data-id="${p.id}" value="1" min="1" max="999">
            <button class="qty-btn qty-plus" data-id="${p.id}" aria-label="Más">+</button>
          </div>
          <button class="add-cart-btn" data-id="${p.id}">Agregar</button>
        </div>
      </div>
    </article>
  `;
}

function bindProductoEvents(onAdded, onError) {
  document.querySelectorAll('.qty-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(`.qty-input[data-id="${btn.dataset.id}"]`);
      if (parseInt(input.value, 10) > 1) input.value = parseInt(input.value, 10) - 1;
    });
  });

  document.querySelectorAll('.qty-plus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(`.qty-input[data-id="${btn.dataset.id}"]`);
      input.value = parseInt(input.value, 10) + 1;
    });
  });

  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const cantidad = parseInt(document.querySelector(`.qty-input[data-id="${id}"]`).value, 10);

      try {
        const res = await fetch(`/api/productos/${id}`);
        const producto = await res.json();
        Cart.addItem(producto, cantidad);
        if (onAdded) onAdded(producto.nombre);
      } catch {
        if (onError) onError();
      }
    });
  });
}

function actualizarFiltroTexto(genero, sub, el) {
  if (!el) return;
  const partes = [];

  if (genero !== 'todos') partes.push(`<strong>${GENEROS[genero]}</strong>`);
  if (sub !== 'todos') partes.push(`<strong>${SUBCATEGORIAS[sub]}</strong>`);

  if (partes.length === 0) {
    el.innerHTML = 'Mostrando todos los productos';
  } else {
    el.innerHTML = `Filtrando por ${partes.join(' · ')}`;
  }
}

function initCartModal(config) {
  const modal = document.getElementById('cartModal');
  if (!modal) return;

  const renderCarrito = () => {
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
  };

  document.getElementById('cartBtn')?.addEventListener('click', () => {
    renderCarrito();
    modal.classList.add('active');
  });

  document.getElementById('closeCart')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.getElementById('whatsappBtn')?.addEventListener('click', () => {
    const msg = Cart.buildWhatsAppMessage();
    if (msg && config.whatsapp) {
      window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  });

  document.getElementById('clearCart')?.addEventListener('click', () => {
    Cart.clear();
    renderCarrito();
  });
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
