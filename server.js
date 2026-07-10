const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readJSON(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(products) {
  const maxId = products.reduce((max, p) => Math.max(max, parseInt(p.id, 10) || 0), 0);
  return String(maxId + 1);
}

// --- API Pública ---

app.get('/api/config', (req, res) => {
  const config = readJSON(CONFIG_FILE, {});
  const { adminPassword, ...publicConfig } = config;
  res.json(publicConfig);
});

app.get('/api/productos', (req, res) => {
  let productos = readJSON(PRODUCTS_FILE, []);
  const { genero, subcategoria, linea } = req.query;

  if (linea === 'infantil') {
    productos = productos.filter((p) => p.genero === 'nino' || p.genero === 'nina');
  } else if (subcategoria && subcategoria !== 'todos') {
    productos = productos.filter((p) => p.subcategoria === subcategoria);
  }

  if (genero && genero !== 'todos') {
    productos = productos.filter((p) => p.genero === genero);
  }

  res.json(productos);
});

app.get('/api/productos/:id', (req, res) => {
  const productos = readJSON(PRODUCTS_FILE, []);
  const producto = productos.find((p) => p.id === req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// --- API Admin ---

function verificarAdmin(req, res, next) {
  const config = readJSON(CONFIG_FILE, {});
  const password = req.headers['x-admin-password'];
  if (password !== config.adminPassword) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const config = readJSON(CONFIG_FILE, {});
  const { password } = req.body;
  if (password === config.adminPassword) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/admin/productos', verificarAdmin, (req, res) => {
  const productos = readJSON(PRODUCTS_FILE, []);
  const { numero, nombre, genero, subcategoria, descripcion, precioUnidad, precioMayor, imagen } = req.body;

  if (!numero || !nombre || !genero || !subcategoria || !precioUnidad || !precioMayor) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const nuevo = {
    id: generateId(productos),
    numero,
    nombre,
    genero,
    subcategoria,
    descripcion: descripcion || '',
    precioUnidad: Number(precioUnidad),
    precioMayor: Number(precioMayor),
    imagen: imagen || ''
  };

  productos.push(nuevo);
  writeJSON(PRODUCTS_FILE, productos);
  res.status(201).json(nuevo);
});

app.put('/api/admin/productos/:id', verificarAdmin, (req, res) => {
  const productos = readJSON(PRODUCTS_FILE, []);
  const index = productos.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const { numero, nombre, genero, subcategoria, descripcion, precioUnidad, precioMayor, imagen } = req.body;
  productos[index] = {
    ...productos[index],
    numero: numero ?? productos[index].numero,
    nombre: nombre ?? productos[index].nombre,
    genero: genero ?? productos[index].genero,
    subcategoria: subcategoria ?? productos[index].subcategoria,
    descripcion: descripcion ?? productos[index].descripcion,
    precioUnidad: precioUnidad !== undefined ? Number(precioUnidad) : productos[index].precioUnidad,
    precioMayor: precioMayor !== undefined ? Number(precioMayor) : productos[index].precioMayor,
    imagen: imagen ?? productos[index].imagen
  };

  writeJSON(PRODUCTS_FILE, productos);
  res.json(productos[index]);
});

app.delete('/api/admin/productos/:id', verificarAdmin, (req, res) => {
  let productos = readJSON(PRODUCTS_FILE, []);
  const antes = productos.length;
  productos = productos.filter((p) => p.id !== req.params.id);
  if (productos.length === antes) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  writeJSON(PRODUCTS_FILE, productos);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`La Bodega del Turco corriendo en http://0.0.0.0:${PORT}`);
});
