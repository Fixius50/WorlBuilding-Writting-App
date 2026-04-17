# ARQUITECTURA LINGÜÍSTICA (CONLANGS)

Diseño del motor de lenguas construidas para el proyecto.

## 1. COMPOSER DE PALABRAS
Sistema que une fonemas basados en reglas de construcción silábica (ej. CVC, CV).

## 2. GLYPH FOUNDRY (ESCRITURA)
- **Motor de Fuentes:** Uso de `opentype.js` para la generación dinámica de archivos `.ttf` en el cliente.
- **Tipado Estricto:** Implementación de interfaces `Shape`, `Layer` y `Canvas` para el diseño de glifos.
- **Soporte SVG:** Importación y renderizado de glifos directamente desde archivos SVG planos.
- **Traductor de transliteración:** Convierte texto latino al alfabeto inventado en tiempo real mapeando caracteres a glifos en la RAM.

## 3. DICCIONARIO Y GRAMÁTICA
- **Léxico Relacional:** Palabras almacenadas con metadatos extendidos (categoría, género, definiciones).
- **Relaciones:** Sistema de reglas gramaticales vinculadas a lenguas específicas.

## PERSISTENCIA Y SYNC
- **Local-First:** Los datos se almacenan en la tabla `entidades` de SQLite local a través de la capa de infraestructura del frontend.
- **Estructura JSON:** Las propiedades visuales de los glifos (`svgPathData`, `layers`) se encapsulan en el campo `contenido_json` de la entidad tipo `Word`.
- **Exportación:** Capacidad de descargar la fuente compilada directamente como archivo físico para uso en software de diseño externo.
