# Documento de Estrategia Técnica (01)

Este documento detalla las decisiones arquitectónicas y el stack tecnológico de **WorldbuildingApp**.

## 1. Stack Tecnológico

* **Core Backend:** Java Spring Boot 4.0.2
* **Frontend:**
  * **Lenguajes:** HTML5, JavaScript (ES6+).
  * **Framework UI:** React + Tailwind CSS.
  * **Estética:** Dark Glassmorphism.
* **Base de Datos:** SQLite local.
  * **Portabilidad:** Cada proyecto es un archivo `.db` independiente.
  * **Migraciones:** Flyway orquestado manualmente.
* **Motor Gráfico:**
  * **Mapas:** Konva.js.
  * **Grafos:** Cytoscape.js.

## 2. Decisiones de Arquitectura

### A. Estabilidad de Datos y Migraciones (Flyway)

* **Problema**: `ddl-auto=create` destruye datos y no escala para múltiples archivos `.db` dinámicos.
* **Solución**: Bean `DatabaseMigration` personalizado.
  * Escanea `src/main/resources/data/*.db` al inicio.
  * Aplica `flyway.repair()` y `flyway.migrate()` a cada archivo individualmente.
  * **Regla**: Nunca usar automigración global de Spring.

### B. Evolución del Modelo de Datos (JSON)

* **Estrategia**: Híbrido Relacional + Documento.
* **Entidad**: `EntidadGenerica`.
* **Extensión**: Columna `json_attributes` (Tipo JSON/TEXT).
  * Permite almacenar atributos dinámicos (Clima, Daño, Inventario) sin alterar el esquema SQL.
  * Evita la tabla EAV `AtributoValor` para lecturas de alto rendimiento.

### D. Gestión de Recursos Binarios (LOBs)

* **Implementación**: Uso de columnas `@Lob` (BLOB en SQLite) para persistir recursos pesados generados por el usuario.
* **Caso de Uso**: Almacenamiento de archivos `.ttf` base para lenguajes personalizados, asegurando que la fuente sea parte del archivo de proyecto `.db` y no dependa de archivos externos volátiles.

### C. Sistema de Proyectos (Multi-Tenant)

* **Arquitectura**: 1 Proyecto = 1 Archivo SQLite.
* **Descubrimiento**: `ProjectDiscoveryService` lee metadatos reales (Título, Imagen) conectándose efímeramente a cada DB, sin mantener pool de conexiones abierto.
* **Contexto**: `TenantContext` filtra las queries de JPA para apuntar al archivo correcto en tiempo real.
* **Soporte Iframe/Omnicanal**: El sistema sincroniza el proyecto activo mediante:
  1. **Sesión HTTP**: Método estándar para navegación directa.
  2. **Header `X-Project-ID`**: Prioritario para peticiones API desde iframes o drawers laterales donde las cookies de sesión pueden ser inconsistentes.
  3. **Activación Proactiva**: El frontend dispara una petición de validación al cargar componentes críticos (ej. Grafo) para asegurar la sincronización del `TenantContext`.

## 4. Gestión de Puertos y Arranque

* **Frontend (Puerto 3000)**: Servidor de desarrollo Vite. Puerta de entrada principal.
* **Backend (Puerto 8080)**: API REST Spring Boot. Se ejecuta en segundo plano.
* **Regla de Oro**: El navegador solo debe abrirse automáticamente en el puerto 3000 (`vite.config.js -> open: true`). El backend no debe disparar eventos de apertura de navegador.

## 3. Filosofía de Desarrollo

1. **Local-First**: La prioridad es la velocidad y privacidad local. La nube es secundaria.
2. **Contexto Explícito**: No existen "defaults" mágicos. Si falta el ID del proyecto, la operación debe fallar.
3. **Persistencia Reactiva**: Todo cambio en el UI debe guardarse (Auto-save) sin bloquear al usuario.
