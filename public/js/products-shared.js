function buildProductosUrl(genero, subcategoria) {
  const params = new URLSearchParams();
  if (genero && genero !== 'todos') params.set('genero', genero);
  if (subcategoria && subcategoria !== 'todos') params.set('subcategoria', subcategoria);
  const qs = params.toString();
  return qs ? `/api/productos?${qs}` : '/api/productos';
}

function productosPageUrl(genero, subcategoria) {
  const params = new URLSearchParams();
  if (genero && genero !== 'todos') params.set('genero', genero);
  if (subcategoria && subcategoria !== 'todos') params.set('subcategoria', subcategoria);
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

function bindProductoEvents() {
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
        mostrarToast(`${producto.nombre} agregado`);
      } catch {
        mostrarToast('Error al agregar', 'error');
      }
    });
  });
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function getHomeProductLimit() {
  return window.matchMedia('(min-width: 640px)').matches ? 6 : 4;
}
