# ESPECIFICACIONES DE EXPANSIÓN (NUEVAS FUNCIONALIDADES)

Este documento detalla las propuestas de expansión para la Fase 5, basadas en el análisis de la competencia y necesidades de autoría profesional.

## 1. PLANIFICACIÓN VISUAL (WHITEBOARDS)
Espacios de planificación desestructurada para complementar el grafo rígido.
- **Pizarras Blancas y Tablones de Corcho:** Lienzo infinito para soltar notas adhesivas (post-its), imágenes de referencia e hilos conectores (estilo "muro de detective").
- **Gestor de Arcos Narrativos:** Diagramas de flujo interactivos para estructurar ritmos de la historia (Planteamiento, Nudo, Clímax) y visualizar tramas secundarias.

## 2. WORLD-BUILDING ESPECIALIZADO
Módulos prefabricados para sistemas complejos:
- **Árboles Genealógicos:** Visualizador de dinastías y linajes con soporte para matrimonios, hijos ilegítimos y sucesiones.
- **Calendarios Fantásticos:** Motor de calendarios con meses inventados, múltiples lunas, ciclos personalizados y registro de eventos climatológicos/festivales.
- **Sistemas de Magia / Religión:** Módulos para registrar reglas (costes, limitaciones, fuentes) y jerarquías de deidades.

## 3. MOTOR LINGÜÍSTICO (CONLANGS PRO)
Evolución del GlyphFoundry hacia la "matemática" del lenguaje:
- **Autogeneración de Conjugaciones:** Sistema de reglas para aplicación automática en el diccionario.
- **Evolución Fonética:** Herramientas para simular cambios de palabras desde lenguas proto-históricas.
- **Guía de Gramática:** Espacio para definir sintaxis (SVO, etc.).

## 4. COMPILACIÓN Y EXPORTACIÓN
- **Compilador de Manuscritos:** Herramienta para unir capítulos del `WritingHub`, generar índices y exportar a `.EPUB`, `.PDF` o `.DOCX`.
- **Wiki Offline:** Generador de sitio HTML estático para compartir el mundo (estilo Wikipedia local).

## 5. COLABORACIÓN P2P (CO-AUTORÍA)
Sistema de colaboración sin servidor central basado en **WebRTC**.

### Flujo UX de Sincronización:
1. **Punto de Entrada:** Configuración del Proyecto -> Colaboración.
2. **Generación de Enlace:** [Generar Código de Invitación WebRTC] (ej. `chronos-link-XyZ89...`).
3. **Conexión:** El Co-autor pega el código en [Unirse a Proyecto Local].
4. **Sincronización Silenciosa:** Conexión directa con indicador verde en Top Bar ("Sincronizando con Usuario B").
5. **Resolución de Conflictos:** Modal en pantalla dividida:
   - **Izquierda:** "Tu versión".
   - **Derecha:** "Versión de [Usuario B]".
   - **Acciones:** [Quedarme la mía], [Aceptar la suya], [Fusionar manualmente].

---
*Nota: Este documento sirve como base técnica para las próximas implementaciones de la Fase 5.*
