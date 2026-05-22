# REGLAS MAESTRAS DE WORLD BUILDING APP

Este documento es la puerta de entrada y gobierno documental del proyecto.
Su objetivo es evitar duplicidades y definir con precisión qué archivo consultar según cada necesidad.

## 1) Principios Inviolables

1. **Fuente Única por Tema:** Las reglas detalladas viven en su documento especializado. Este archivo no debe duplicar especificaciones técnicas extensas.
2. **Consistencia Documental:** Si cambia una arquitectura o flujo, se actualiza el documento especializado correspondiente y su trazabilidad en bitácora.
3. **Doble Verificación:** Antes de implementar, validar estado real del código y documento fuente aplicable.
4. **Modularidad:** Mantener separación de responsabilidades por capas y por features.

## 2) Mapa de Referencias por Caso de Uso

### A) Arquitectura, stack y reglas técnicas base

- Leer: `01_Estrategia_Tecnica.md`
- Cubre: arquitectura híbrida, Clean Architecture, reglas de integración y estado técnico general.

### B) Diseño visual, estética y UX

- Leer: `02_Diseño_UI_UX.md`
- Cubre: lineamientos visuales, lenguaje estético y comportamiento de interfaz.

### C) Prioridades y planificación

- Leer: `03_Roadmap_Vivo.md`
- Cubre: estado de fases, entregables completados y próximos objetivos.

### D) Estructura de workspaces y navegación macro

- Leer: `04_Arquitectura_Workspaces.md`
- Cubre: organización del espacio de trabajo, distribución de áreas y flujo de datos.

### E) Historial de decisiones y cambios ejecutados

- Leer: `03_Roadmap_Vivo.md`
- Cubre: cronología técnica y justificación de cambios.

### F) Empaquetado y distribución

- Leer: este mismo documento (Sección 5).
- Cubre: comandos operativos, build y distribución del ejecutable.

## 3) Regla de Precedencia (Cuando haya conflicto)

1. Este documento define **gobierno y enrutamiento documental**.
2. El documento especializado manda sobre su tema.
3. La bitácora registra cambios históricos, pero no reemplaza especificaciones técnicas vigentes.
4. Ante contradicción entre documentos especializados, prevalece el más reciente que esté alineado con el estado real del código.

## 4) Protocolo de Actualización Cruzada

Cuando se realice un cambio estructural relevante:

1. Actualizar primero el documento especializado afectado.
2. Registrar fecha e impacto en `03_Roadmap_Vivo.md`.
3. Revisar este documento (`00_Reglas_Maestras.md`) solo si cambia el enrutamiento de referencias o la precedencia.
4. Verificar que `03_Roadmap_Vivo.md` refleje el estado del hito.

## 5) Operación y Empaquetado

### Comandos rápidos

Desarrollo local:

```powershell
run-app.bat
```

Alternativa manual:

```powershell
npm run dev
```

Build frontend:

```powershell
npm run build
```

Build backend auxiliar:

```powershell
mvn clean package
```

### Naturaleza del paquete

La aplicación se distribuye como stack híbrido local-first:

1. UI Vite (frontend).
2. Servidor auxiliar Java (bridge de sistema/archivos).

### Estrategia de lanzamiento

Actualmente `run-app.bat` orquesta:

1. Inicio del servidor Java local.
2. Inicio de frontend.
3. Apertura de la interfaz en entorno local.

### Distribución final

Se distribuye como instalador/ejecutable de escritorio (`.exe`) para uso local sin configuración manual del usuario final.
