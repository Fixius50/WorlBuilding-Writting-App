# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto.

## STACK TECNOLÓGICO

*   **Backend:** Java 21 con Spring Boot 3.x.
    *   Seguridad: Spring Security (JWT).
    *   API: RESTful.
    *   Persistencia: H2 para desarrollo, PostgreSQL para producción.
*   **Frontend:** React 18+ con Vite.
    *   Estado: Context API para universalidad, local hooks para componentes.
    *   Navegación: React Router Dom.
    *   Estilos: CSS puro con variables globales + Micro-clases de utilidad. No Tailwind (salvo que sea estrictamente necesario para un módulo aislado).
*   **Empaquetado:** JPackage (Generación de EXE para Windows).

## ARQUITECTURA DE DATOS

1.  **Entidades Base:** Todo en el mundo es una "Entidad".
2.  **Relaciones:** Sistema de grafos para conectar personajes, lugares y eventos.
3.  **Versioning:** Soporte para backups y snapshots manuales para evitar pérdida de mundos.

## PROTOCOLO DE CONEXIÓN FRONT-BACK

*   El frontend consume el backend en el puerto `8080` (estándar).
*   El backend sirve el frontend construido desde el recurso estático en producción.
*   En desarrollo, se usa el Proxy del Vite para evitar problemas de CORS.
