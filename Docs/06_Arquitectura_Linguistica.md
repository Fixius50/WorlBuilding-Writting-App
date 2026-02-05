# Arquitectura del Sistema Lingüístico (06)

Este documento detalla la implementación técnica del **Linguistics Hub** y el motor **Rune Foundry v2.0**, diseñados para la creación, gestión y compilación de lenguajes construidos (Conlangs).

## 🧩 Componentes Principales

### 1. Hub de Lingüística (Frontend)

El hub centraliza tres vistas principales:

- **Léxico**: Gestión de palabras, categorías gramaticales y definiciones.
- **Traductor**: Previsualización en tiempo real de cadenas de texto convertidas a glifos.
- **Rune Foundry (Biblia Léxica)**: Entorno de diseño de glifos y compilación de fuentes.

### 2. Automatización de Glifos (Mapeo PUA)

Para eliminar la entrada manual de caracteres, el sistema utiliza el rango **Unicode Private Use Area (PUA)**:

- **Rango**: `U+E000` en adelante.
- **Lógica**: Al crear un glifo, el sistema busca el último código utilizado en la base de datos y asigna el siguiente de forma incremental.
- **Mapeo Técnico**: El campo `unicodeCode` en la tabla `palabra` actúa como el ID único para el motor de fuentes.

### 3. Motor de Fuentes (Font Engine)

Integración con `opentype.js` para transformar datos vectoriales en binarios tipográficos:

- **Input**: `svgPathData` (Cadenas de paths SVG almacenadas en el léxico).
- **Proceso**: Conversión de coordenadas SVG a glifos de fuente (unidades por Em: 1024).
- **Output**: Generación de archivo `.ttf` (TrueType Font).

## 💾 Persistencia de Datos

### Backend (Spring Boot + JPA)

- **Modelo `Conlang`**:
  - Atributo `@Lob byte[] fontBinary`: Almacena el último binario de la fuente compilada.
  - Atributos de configuración: Nombre de fuente, autor, formato, ligaduras y interletraje.
- **Modelo `Palabra`**:
  - Atributo `String unicodeCode`: Almacena el código PUA asignado (ej. "U+E000").
  - Atributo `String svgPathData`: Almacena el path vectorial del glifo.

### Endpoints Clave

- `GET /api/conlang/lenguas`: Recupera las lenguas del proyecto activo.
- `POST /api/conlang/lengua`: Crea una nueva lengua (auto-inicialización si el sistema está vacío).
- `POST /api/conlang/{id}/upload-font`: Recibe el binario `.ttf` generado por el frontend y lo persiste.

## 🛠️ Flujo de Trabajo del Usuario (Automático)

1. **Creación**: El usuario pulsa "Dibujar". Se crea un registro `Palabra` tipo `GLYFO` con un ID Unicode automático.
2. **Edición**: Se abre el editor de simbología para definir el path SVG.
3. **Consolidación**: Al pulsar "Exportar Recursos", el frontend compila todos los glifos en un `.ttf`, lo descarga localmente y lo sincroniza con el servidor.

---
**Nota**: Esta arquitectura permite que la lengua creada sea usable fuera de la aplicación simplemente instalando el archivo `.ttf` generado.
