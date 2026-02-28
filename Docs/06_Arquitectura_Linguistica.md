# ARQUITECTURA LINGÜÍSTICA (CONLANGS)

Diseño del motor de lenguas construidas para el proyecto.

## 1. COMPOSER DE PALABRAS
Sistema que une fonemas basados en reglas de construcción silábica (ej. CVC, CV).

## 2. GLYPH FOUNDRY (ESCRITURA)
- Soporte para fuentes personalizadas o glifos SVG.
- Traductor de transliteración: Convierte texto latino a el alfabeto inventado en tiempo real.

## 3. DICCIONARIO Y GRAMÁTICA
- Gestión de categorías gramaticales.
- Derivación automática basada en afijos.

## PERSISTENCIA
Las lenguas se guardan como archivos `.json` dentro de la carpeta del proyecto correspondiente para que cada mundo pueda tener sus propios idiomas.
