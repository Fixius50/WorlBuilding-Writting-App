# Documento de Diseño y UX: Chronos Atlas (02)

Descripción del sistema de diseño visual y funcional **"Arcane Void"** para WorldbuildingApp.

## 1. Concepto Visual: Arcane Void

El diseño busca un equilibrio entre la claridad de un IDE moderno (VS Code) y la mística de un antiguo estudio de alquimia o grimorio mágico.

### Paleta de Colores

* **Void Dark**: `#09090b` (Fondo principal, profundidad infinita).
* **Glass Border**: `rgba(255, 255, 255, 0.05)` (Bordes sutiles).
* **Accent Indigo**: `#6366f1` (Acción Primaria, Magia).
* **Accent Emerald**: `#10b981` (Confirmación, Vida, Naturaleza).
* **Parchment White**: `#fafafa` (Texto principal de lectura).

### Tipografía

* **Interfaz**: `Outfit` / `Inter` (Sans-serif, limpia, legible a tamaños pequeños).
* **Narrativa**: `Cormorant Garamond` / `Playfair Display` (Serif, para bloques de texto de lore).

## 2. Componentes de UI (Layout "Next")

### A. Estructura de 3 Paneles

El layout principal se divide para maximizar el contexto sin cambiar de pantalla:

1. **Panel Izquierdo (Biblia)**: Árbol de navegación jerárquico. Carpetas y Entidades.
2. **Panel Central (Lienzo)**: Área de trabajo principal (Editor de texto, Mapa, Grafo).
3. **Panel Derecho (Inspector)**: Propiedades, atributos y herramientas contextuales.

### B. Navigation Dock

Barra flotante inferior con efecto *Glassmorphism*. Contiene los accesos rápidos a módulos globales (Timeline, Mapa Mundial, Ajustes) sin invadir el espacio vertical.

## 3. Características Funcionales

### Entity Builder (Constructor de Fichas)

* **Drag & Drop**: Los usuarios construyen la estructura de sus fichas arrastrando "Cajas de Atributos" (Texto, Imagen, Stats).
* **Herencia**: Las carpetas definen la plantilla por defecto para las entidades nuevas en su interior.

### Editor de Mapas (Integrado)

* **Panel Derecho**: Control de capas, rejilla y propiedades del objeto seleccionado.
* **Lienzo Infinito**: Navegación (Pan/Zoom) fluida con Konva.js.

### Sistema de Gráficos (Network)

* Visualización de relaciones entre entidades como nodos físicos.
* Filtros visuales por categoría (Individuo, Lugar, Grupo).
