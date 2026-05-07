# CONTEXTO: STACK BACKEND (SERVIDOR AUXILIAR)

Directrices para la capa del servidor Java. Consumido por el **[MOD-2] Arquitecto** y **[MOD-3] Auditor**.

## ⚙️ Tecnologías Core
- **Lenguaje**: Java 21 LTS (o Java 24 según configuración).
- **Framework**: Spring Boot 3.x (o Spring 4.3.x legacy si así se especifica en el pom).
- **Empaquetado**: Maven (`pom.xml`) + JPackage (para generar envoltorios de sistema operativo).

## 🛡️ Reglas del Backend Auxiliar

### 1. Rol Secundario (Thin Server)
- El backend **NO ES** la fuente principal de la verdad. La base de datos vive en el navegador del usuario.
- El servidor de Spring se emplea exclusivamente como un *daemon* o agente de fondo para tareas pesadas:
  - Generación de copias de seguridad (Backup).
  - Exportación de la Biblia del Mundo a formatos físicos (PDF, Word).
  - Interacciones con el sistema de archivos del usuario (si están fuera del sandbox web).
  - Proxy para Inteligencia Artificial o APIs externas si fuera necesario.

### 2. Estándares de Arquitectura Java
- **Jerarquía Estricta**: Mantener el flujo clásico `DTO -> Controller -> Service -> Repository`.
- **Validación de Archivos**: Antes de realizar escrituras en disco (ej. Exportaciones), validar la existencia y permisos de las rutas.
- **Seguridad CORS**: El backend debe permitir solicitudes desde los puertos locales donde se levanta el frontend (generalmente `localhost:5173`).

### 3. Operaciones de Despliegue
- Revisa el pipeline de JPackage en caso de errores de construcción. El `.jar` generado está destinado a ejecutarse de manera invisible acompañando al frontend web.
