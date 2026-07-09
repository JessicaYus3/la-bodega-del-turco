# La Bodega del Turco - Catálogo Web

Catálogo de ropa importada con precios al detalle y al por mayor. Incluye carrito con envío por WhatsApp y panel de administración.

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración

Edita el archivo `data/config.json` con tus datos reales:

```json
{
  "whatsapp": "573001234567",
  "telefono": "+57 300 123 4567",
  "direccion": "Tu dirección aquí",
  "horario": "Lunes a Sábado: 9:00 AM - 7:00 PM",
  "adminPassword": "tu_contraseña_segura"
}
```

- **whatsapp**: Número con código de país, sin `+` ni espacios (ej: `573001234567`)
- **adminPassword**: Contraseña para acceder al panel de administración

## Uso

### Catálogo (público)
- Navega por categorías: Ropa Interior, Deportiva, Hombre, Mujer
- Cada producto muestra precio al detalle (1-6 unidades) y al por mayor (más de 6)
- Agrega productos al carrito y envía el pedido por WhatsApp

### Administración
- Accede en [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- Contraseña por defecto: `admin123` (cámbiala en `config.json`)
- Agrega, edita y elimina productos manualmente

### Campos del producto
| Campo | Descripción |
|-------|-------------|
| Número | Código único del producto (ej: BT-001) |
| Nombre | Nombre del producto |
| Categoría | hombre, mujer, nino, nina |
| Subcategoría | ropa-interior, medias, ropa-deportiva, otros |
| Precio Unidad | Precio al detalle (1 a 6 unidades) |
| Precio Mayor | Precio al por mayor (más de 6 unidades) |
| Descripción | Texto opcional |
| Imagen | URL de imagen opcional |

## Estructura del proyecto

```
├── server.js          # Servidor Express + API
├── data/
│   ├── config.json    # Configuración (contacto, contraseña)
│   └── products.json  # Base de datos de productos
└── public/
    ├── index.html     # Catálogo público
    ├── admin.html     # Panel de administración
    ├── css/styles.css
    ├── js/
    │   ├── app.js     # Lógica del catálogo
    │   ├── cart.js    # Carrito y WhatsApp
    │   └── admin.js   # Panel admin
    └── images/logo.png
```
