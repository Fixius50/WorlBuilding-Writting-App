# CONTEXTO: ARQUITECTURA HÍBRIDA CORE

El diseño maestro del ecosistema Chronos Atlas. Consumido por el **[MOD-1] Estratega**.

## 🧠 Paradigma: Thick Frontend & Thin Backend
La aplicación opera en un entorno híbrido desacoplado.

### 1. El Cliente es el Soberano (Local-First)
- Los datos de worldbuilding, escritos, grafos y parámetros residen íntegramente en la máquina del usuario dentro del navegador (OPFS - Origin Private File System).
- Esto garantiza latencia cero, independencia de servidores en la nube y privacidad absoluta.

### 2. El Servidor es el Obrero (Auxiliar)
- A diferencia del modelo web tradicional, el backend (Java Spring) no sirve los datos iniciales de la aplicación.
- Actúa como una herramienta de línea de comandos en forma de API REST local, esperando peticiones desde el frontend para tareas de alto costo computacional o acceso profundo al disco.

### 3. Separación de Preocupaciones
- Si el servidor Java colapsa o no arranca, el usuario AÚN DEBE poder escribir, editar su grafo y gestionar su Biblia del Mundo. Solo se deshabilitarán los procesos pesados (ej. exportaciones masivas).
- Si el frontend falla, el backend permanece estático sin verse afectado, evitando caídas completas del programa como ocurriría en aplicaciones Electron monolíticas mal optimizadas.
