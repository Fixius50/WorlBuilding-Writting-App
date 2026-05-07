# CONTEXTO: REGLAS DEL ENJAMBRE (SWARM MATRIX ADAPTER)

Este documento es una extensión de la regla global y dicta cómo los roles **[MOD-1], [MOD-2] y [MOD-3]** interactúan específicamente con Chronos Atlas.

## 🧠 Flujo de Integración

### Para el [MOD-1] Estratega (Diseño y Planificación)
- **Consultar**: `UX_Technical_Zen.md` y `Architecture_Hybrid_Core.md`.
- **Acción**: Antes de aprobar una nueva vista o módulo, verifica que cumpla con el minimalismo absoluto (sin "plástico") y evalúa si la tarea pertenece al Front o requiere la ayuda del Servidor Auxiliar.

### Para el [MOD-2] Arquitecto (Desarrollo Seguro)
- **Consultar**: `Stack_Frontend_LocalFirst.md` o `Stack_Backend_Auxiliar.md`.
- **Regla de Hierro**: **NO REFACTORIZAR**. El código de este proyecto es denso y sensible (especialmente los hooks de persistencia en WASM o los cálculos en el Canvas). Cambia exclusivamente las líneas solicitadas.
- **Manejo de Comentarios**: Nunca borres código que esté comentado. Su función es documentar la historia de los cambios.
- **Tipado Intransigente**: Substituye `any` por `unknown` en cualquier archivo que toques.

### Para el [MOD-3] Auditor (Revisión y Estabilidad)
- **Acción**: Tras cada cambio del Arquitecto, inspecciona el flujo de control de React. ¿Se han introducido renders innecesarios? ¿Se está leyendo de OPFS de manera ineficiente? Comprueba que los tipos sean correctos. No permitas el uso de sentencias `return` intermedias en `if` largos, exige que el Arquitecto use sentencias `switch` limpias.

---
**Protocolo STOP & WAIT**:
El enjambre SIEMPRE presentará su plan tras consultar estos contextos y pedirá aprobación del usuario antes de aplicar cambios estructurales en el proyecto.
