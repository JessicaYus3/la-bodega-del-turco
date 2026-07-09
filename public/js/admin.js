const SESSION_KEY = 'bodega_turco_admin';

let adminPassword = '';
let editandoId = null;

function getPassword() {
  return sessionStorage.getItem(SESSION_KEY) || '';
}

function setPassword(pw) {
  sessionStorage.setItem(SESSION_KEY, pw);
  adminPassword = pw;
}

function clearPassword() {
  sessionStorage.removeItem(SESSION_KEY);
  adminPassword = '';
}

function showPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  cargarProductos();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function formatPrecio(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

async function apiAdmin(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Password': adminPassword,
    ...options.headers
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

async function cargarProductos() {
  const tbody = document.getElementById('productsTable');
  try {
    const res = await fetch('/api/productos');
    const productos = await res.json();

    document.getElementById('productCount').textContent = productos.length;

    if (productos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay productos.</td></tr>';
      return;
    }

    tbody.innerHTML = productos.map((p) => `
      <tr>
        <td><strong>${p.numero}</strong></td>
        <td>${p.nombre}</td>
        <td><span class="categoria-badge">${GENEROS[p.genero] || p.genero}</span></td>
        <td>${SUBCATEGORIAS[p.subcategoria] || p.subcategoria}</td>
        <td>${formatPrecio(p.precioUnidad)}</td>
        <td>${formatPrecio(p.precioMayor)}</td>
        <td>
          <div class="table-actions">
            <button class="btn-edit" data-id="${p.id}">Editar</button>
            <button class="btn-delete" data-id="${p.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => editarProducto(btn.dataset.id, productos));
    });

    tbody.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => eliminarProducto(btn.dataset.id));
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar.</td></tr>';
  }
}

function editarProducto(id, productos) {
  const p = productos.find((prod) => prod.id === id);
  if (!p) return;

  editandoId = id;
  document.getElementById('productId').value = id;
  document.getElementById('numero').value = p.numero;
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('genero').value = p.genero;
  document.getElementById('subcategoria').value = p.subcategoria;
  document.getElementById('precioUnidad').value = p.precioUnidad;
  document.getElementById('precioMayor').value = p.precioMayor;
  document.getElementById('descripcion').value = p.descripcion || '';
  document.getElementById('imagen').value = p.imagen || '';

  document.getElementById('formTitle').textContent = 'Editar producto';
  document.getElementById('submitBtn').textContent = 'Guardar cambios';
  document.getElementById('cancelEdit').style.display = 'inline-flex';

  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  editandoId = null;
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('formTitle').textContent = 'Agregar producto';
  document.getElementById('submitBtn').textContent = 'Agregar producto';
  document.getElementById('cancelEdit').style.display = 'none';
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    await apiAdmin(`/api/admin/productos/${id}`, { method: 'DELETE' });
    mostrarToast('Producto eliminado');
    cargarProductos();
  } catch (err) {
    mostrarToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedPw = getPassword();
  if (savedPw) {
    adminPassword = savedPw;
    showPanel();
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setPassword(password);
        errorEl.textContent = '';
        showPanel();
      } else {
        const data = await res.json();
        errorEl.textContent = data.error || 'Contraseña incorrecta';
      }
    } catch {
      errorEl.textContent = 'Error de conexión';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearPassword();
    showLogin();
  });

  document.getElementById('cancelEdit').addEventListener('click', resetForm);

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      numero: document.getElementById('numero').value.trim(),
      nombre: document.getElementById('nombre').value.trim(),
      genero: document.getElementById('genero').value,
      subcategoria: document.getElementById('subcategoria').value,
      descripcion: document.getElementById('descripcion').value.trim(),
      precioUnidad: document.getElementById('precioUnidad').value,
      precioMayor: document.getElementById('precioMayor').value,
      imagen: document.getElementById('imagen').value.trim()
    };

    try {
      if (editandoId) {
        await apiAdmin(`/api/admin/productos/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify(datos)
        });
        mostrarToast('Producto actualizado');
      } else {
        await apiAdmin('/api/admin/productos', {
          method: 'POST',
          body: JSON.stringify(datos)
        });
        mostrarToast('Producto agregado');
      }

      resetForm();
      cargarProductos();
    } catch (err) {
      mostrarToast(err.message, 'error');
    }
  });
});
