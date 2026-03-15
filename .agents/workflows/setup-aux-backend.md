---
description: Configurar y arrancar un entorno dual (Vite + Spring Boot auxiliar).
---
# Flujo de Trabajo: Configuración Entorno Híbrido

Este Skill enseña al agente cómo gestionar el desarrollo en la arquitectura Frontend-Centric con Backend Auxiliar en Java.

## Contexto de Herramientas
- El frontend usa **npm** / **Vite**.
- El backend usará **Maven** / **Java 24** (Spring 4).

## Pasos de Ejecución

1. **Validación de Entorno Java**:
   - Ejecutar `java -version` y detectar compatibilidad.
   - Si no hay JDK moderno, alertar instando a instalación de un Oracle/OpenJDK 24.

2. **Estructura del Backend**:
   - Si no existe, crear la carpeta `aux-server/`.
   - Generar un `pom.xml` básico con Spring Framework 4.3.30.RELEASE y plugins de compilación ajustados al source de Java (ej. `--enable-preview` si es necesario).

3. **Iniciadores Paralelos**:
   - Configurar scripts bat/sh en la raíz del monorepo (`start-dev.bat`) que inicien tanto el proceso web como el daemon de Java (`mvn spring-boot:run` si es SB u otro runner).
