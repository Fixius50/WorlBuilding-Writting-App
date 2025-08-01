# Frontend - Worldbuilding App

Esta carpeta contiene todo el código del frontend de la aplicación Worldbuilding.

## Estructura

```
frontEnd/
├── menuInicialLog.html          # Página principal con React
├── css/                         # Archivos CSS
│   ├── menuInicialLog.css
│   └── ventanaProyectos.css
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
└── static/                      # Build de React (sin media)
    ├── css/
    └── js/
```

## Tecnologías

- **React**: Para la página principal (menuInicialLog.html)
- **HTML/CSS/JavaScript**: Para las páginas secundarias
- **Spring Boot**: Servidor backend

## Desarrollo

### React (Página Principal)
- **Nota**: El proyecto React se desarrolla en una ubicación temporal
- Para desarrollo: Crear proyecto React temporalmente y hacer build
- Para build: `npm run build` y copiar a `frontEnd/static/`
- El build se sirve desde `frontEnd/static/`

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
- React se sirve desde `frontEnd/static/`
- No se genera carpeta `media/` (más eficiente)
- **Estructura simplificada**: Solo `frontEnd/` y `Otros/` en static 