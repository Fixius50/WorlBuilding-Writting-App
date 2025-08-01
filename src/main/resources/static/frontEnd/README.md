# Frontend - Worldbuilding App

Esta carpeta contiene todo el código del frontend de la aplicación Worldbuilding.

## Estructura

```
frontEnd/
├── menuInicialLog.html          # Página principal con React
├── css/                         # Archivos CSS
│   ├── menuInicialLog.css       # CSS de la página principal
│   ├── ventanaProyectos.css     # CSS de la ventana de proyectos
│   ├── main.ae8218fa.css        # CSS de React (build)
│   └── main.ae8218fa.css.map    # Source map del CSS de React
├── html/                        # Páginas HTML
│   ├── ventanaProyectos.html
│   ├── ventanaCreacion.html
│   ├── ventanaAjustes.html
│   └── opciones/                # Subpáginas de opciones
│       ├── entidad-individual.html
│       ├── entidad-colectiva.html
│       ├── construcciones.html
│       ├── zonas.html
│       ├── relaciones.html
│       └── efectos-magias.html
├── js/                          # Archivos JavaScript
│   ├── main.30860cda.js         # JavaScript principal de React (build)
│   ├── main.30860cda.js.map     # Source map del JS principal
│   ├── main.30860cda.js.LICENSE.txt
│   ├── 453.0324e4b5.chunk.js    # Chunk de React (build)
│   ├── 453.0324e4b5.chunk.js.map
│   ├── main.efb1c865.js         # Versión anterior del JS de React
│   ├── main.efb1c865.js.map
│   └── main.efb1c865.js.LICENSE.txt
├── asset-manifest.json          # Manifesto de React
├── manifest.json                # Manifesto de la aplicación
├── favicon.ico                  # Icono de la aplicación
├── logo192.png                  # Logo 192px
├── logo512.png                  # Logo 512px
├── robots.txt                   # Configuración para robots
└── index.html                   # HTML base de React
```

## Tecnologías

- **React**: Para la página principal (menuInicialLog.html)
- **HTML/CSS/JavaScript**: Para las páginas secundarias
- **Spring Boot**: Servidor backend

## Desarrollo

### React (Página Principal)
- **Nota**: El proyecto React se desarrolla en una ubicación temporal
- Para desarrollo: Crear proyecto React temporalmente y hacer build
- Para build: `npm run build` y copiar archivos a `frontEnd/`
- **Organización**: Los archivos de React se organizan en `css/` y `js/`

### Páginas HTML
- Las páginas HTML están en `frontEnd/html/`
- Los estilos CSS están en `frontEnd/css/`
- Las imágenes se referencian desde `../Otros/imagenes/`

## Configuración de Imágenes

### ✅ Configuración Actual (Recomendada)
- **React usa**: `Otros/imagenes/` (rutas públicas)
- **HTML/CSS usan**: `Otros/imagenes/` (rutas relativas)
- **Ventajas**:
  - No se duplican imágenes
  - Estructura más limpia
  - Fácil mantenimiento
  - No se genera carpeta `media/`

### 🔄 Flujo de Imágenes
1. **Ubicación única**: `Otros/imagenes/`
2. **React**: Accede via rutas públicas (`/Otros/imagenes/`)
3. **HTML/CSS**: Accede via rutas relativas (`../../Otros/imagenes/`)

## Rutas

- **Página principal**: `/frontEnd/menuInicialLog.html`
- **Páginas secundarias**: `/frontEnd/html/[nombre].html`
- **Recursos**: `/Otros/imagenes/`, `/Otros/audios/`, `/Otros/videos/`

## Notas

- Todas las rutas están actualizadas para la nueva estructura
- Las imágenes se cargan desde `Otros/imagenes/` (ubicación centralizada)
- **Organización por tipo**: CSS en `css/`, JS en `js/`, HTML en `html/`
- No se genera carpeta `media/` (más eficiente)
- **Estructura simplificada**: Solo `frontEnd/` y `Otros/` en static 