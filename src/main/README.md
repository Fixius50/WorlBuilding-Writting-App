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
│   ├── main.efb1c865.js.LICENSE.txt
├── package.json                 # Configuración del proyecto React
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
- **React Flow**: Para crear diagramas y mapas interactivos
- **HTML/CSS/JavaScript**: Para las páginas secundarias
- **Spring Boot**: Servidor backend

## Desarrollo

### React (Página Principal)
- **Package.json**: Configurado con todas las dependencias necesarias
- **Para desarrollo**: `npm install` y luego `npm start`
- **Para build**: `npm run build` y copiar archivos a `css/` y `js/`
- **Organización**: Los archivos de React se organizan en `css/` y `js/`

### React Flow 🌍
- **Librería**: @xyflow/react para diagramas interactivos
- **Dependencia incluida**:
  - `@xyflow/react` - Librería principal (incluye todos los componentes)

### Scripts Disponibles
```bash
npm start          # Inicia el servidor de desarrollo
npm run build      # Construye la aplicación para producción
npm test           # Ejecuta las pruebas
npm run dev        # Alias para npm start
npm run prod       # Alias para npm run build
```

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

## React Flow - Casos de Uso

### 🗺️ Mapas de Mundo
- Crear mapas interactivos de territorios
- Conectar reinos, ciudades y regiones
- Visualizar relaciones políticas y comerciales

### 👥 Relaciones de Personajes
- Mapear relaciones entre personajes
- Mostrar alianzas y conflictos
- Crear árboles genealógicos

### 🏰 Estructuras Organizacionales
- Diagramas de gobiernos y organizaciones
- Jerarquías militares y religiosas
- Flujos de poder y autoridad

### 📚 Sistemas de Magia
- Conectar elementos mágicos
- Mostrar flujos de energía
- Visualizar rituales y hechizos

## Notas

- Todas las rutas están actualizadas para la nueva estructura
- Las imágenes se cargan desde `Otros/imagenes/` (ubicación centralizada)
- **Organización por tipo**: CSS en `css/`, JS en `js/`, HTML en `html/`
- No se genera carpeta `media/` (más eficiente)
- **Estructura simplificada**: Solo `frontEnd/` y `Otros/` en static
- **Package.json**: Incluido para facilitar el desarrollo de React
- **React Flow**: Librería disponible para crear diagramas interactivos 