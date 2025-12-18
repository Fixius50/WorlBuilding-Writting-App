# Visión del Proyecto
**WorldbuildingApp (Chronos Atlas)** es una herramienta de construcción de mundos "Local-First" que permite a escritores y DMs diseñar universos complejos.
La aplicación busca la robustez de **Java Spring Boot** con la portabilidad de una **Base de Datos Embebida (H2)**, eliminando la necesidad de servidores externos como XAMPP/MySQL. Simple: "Ejecutar y Usar".

# Estrategia Técnica
Mantenemos el stack Java (backend) pero reemplazamos la infraestructura de base de datos para lograr una experiencia "Serverless/Standalone".

## Stack Tecnológico (v4 - Refactor)
*   **Backend:** Java 17+ con Spring Boot 3.
*   **Base de Datos:** **H2 Database (Modo Archivo)**.
    *   *Antes:* MySQL (requería XAMPP).
    *   *Ahora:* Archivo `.mv.db` local en la carpeta del proyecto.
*   **Frontend:** HTML/JS/CSS (Servido por Spring Boot / Thymeleaf o estático en `src/main/resources/static`).
*   **Ejecución:** Archivo `.jar` ejecutable o script local. Sin instalación de servicios.

## Migración (Análisis de Versiones)
*   **v3 (Next.js):** Descartada por incompatibilidad con el requisito de "Mantener Java".
*   **v2 (Java Hybrid):** **Versión Base**. Contiene la lógica Spring Boot madura.
*   **Objetivo:** Mover `v2` a `Root` y migrar `MySQL Dialect` -> `H2 Dialect`.

# Sistema de Diseño (UI Kit)
*   *Heredado de v2*, con mejoras puntuales de estilo si se requieren.
*   Prioridad: Funcionalidad offline y persistencia de datos local.

# Referencias
*   `v2/src/main/java`: Núcleo lógico a preservar.
*   `v2/src/main/resources/application.properties`: Archivo clave a modificar para H2.
