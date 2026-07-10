const CATEGORIAS_CARRUSEL = [
  {
    id: 'medias-tobilleras',
    titulo: 'Medias Tobilleras',
    badge: 'Medias',
    imagen: '/images/carousel/medias-tobilleras.jpeg',
    fit: 'contain',
    url: '/productos.html?subcategoria=medias'
  },
  {
    id: 'medias-canilleras',
    titulo: 'Medias Canilleras',
    badge: 'Medias',
    imagen: '/images/carousel/medias-canilleras.jpeg',
    fit: 'cover',
    position: 'center center',
    url: '/productos.html?subcategoria=medias'
  },
  {
    id: 'medias-deportivas',
    titulo: 'Medias Deportivas',
    badge: 'Medias',
    imagen: '/images/carousel/medias-deportivas.jpeg',
    fit: 'cover',
    position: 'center 20%',
    url: '/productos.html?subcategoria=medias'
  },
  {
    id: 'tops',
    titulo: 'Tops y Camisetas',
    badge: 'Deportivo',
    imagen: '/images/carousel/tops-camisetas.jpeg',
    fit: 'cover',
    position: 'center top',
    url: '/productos.html?subcategoria=ropa-deportiva'
  },
  {
    id: 'leggings',
    titulo: 'Leggings',
    badge: 'Deportivo',
    imagen: '/images/carousel/leggings.jpeg',
    fit: 'cover',
    position: 'center top',
    url: '/productos.html?subcategoria=ropa-deportiva'
  },
  {
    id: 'ropa-interior',
    titulo: 'Ropa Interior',
    badge: 'Interior',
    imagen: '/images/carousel/ropa-interior.jpeg',
    fit: 'contain',
    url: '/productos.html?subcategoria=ropa-interior'
  },
  {
    id: 'boxers',
    titulo: 'Boxers',
    badge: 'Interior',
    imagen: '/images/carousel/boxers.jpeg',
    fit: 'contain',
    url: '/productos.html?subcategoria=ropa-interior'
  },
  {
    id: 'deportivo',
    titulo: 'Ropa Deportiva',
    badge: 'Deportivo',
    imagen: '/images/carousel/ropa-deportiva.jpeg',
    fit: 'contain',
    url: '/productos.html?subcategoria=ropa-deportiva'
  },
  {
    id: 'infantil',
    titulo: 'Línea Infantil',
    badge: 'Niños',
    imagen: '/images/carousel/linea-infantil.jpeg',
    fit: 'cover',
    position: 'center top',
    url: '/productos.html?linea=infantil'
  },
  {
    id: 'vestidos',
    titulo: 'Vestidos y Faldas',
    badge: 'Mujer',
    imagen: '/images/carousel/vestidos-faldas.jpeg',
    fit: 'cover',
    position: 'center top',
    url: '/productos.html?genero=mujer'
  }
];

const GENEROS = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  nino: 'Niño',
  nina: 'Niña'
};

const SUBCATEGORIAS = {
  'ropa-interior': 'Ropa Interior',
  medias: 'Medias',
  'ropa-deportiva': 'Ropa Deportiva',
  otros: 'Otros'
};

const LINEAS = {
  medias: 'Medias',
  'ropa-interior': 'Ropa Interior',
  'ropa-deportiva': 'Deportivo',
  infantil: 'Infantil'
};

const LINEA_IMAGENES = {
  medias: '/images/linea-medias.png',
  'ropa-interior': '/images/linea-interior.png',
  'ropa-deportiva': '/images/linea-deportivo.png',
  infantil: '/images/linea-infantil.png'
};

const SUBCATEGORIA_IMAGENES = {
  'ropa-interior': '/images/linea-interior.png',
  medias: '/images/linea-medias.png',
  'ropa-deportiva': '/images/linea-deportivo.png',
  otros: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  todos: 'https://images.unsplash.com/photo-1483985988350-763728e3685b?w=400&h=400&fit=crop'
};

const GENERO_IMAGENES = {
  mujer: '/images/genero-mujer.png',
  hombre: '/images/genero-hombre.png',
  nina: '/images/genero-nina.png',
  nino: '/images/genero-nino.png',
  todos: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=650&fit=crop'
};
