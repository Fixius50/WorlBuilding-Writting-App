# Reglas Estrictas de Desarrollo: Chronos Atlas

Este documento establece los principios innegociables para el desarrollo y mantenimiento de **WorldbuildingApp (Chronos Atlas)**. Estas reglas han sido definidas para garantizar la integridad de los datos y la transparencia del sistema.

---

## 1. Prohibición de "Self-Healing" (Auto-Recuperación Silenciosa)

No se permite que el sistema "cure" o "maquille" inconsistencias de datos de forma automática y silenciosa.

* **Regla**: Si falta un registro de metadatos (`Cuaderno`), una carpeta raíz o un contexto de proyecto, el sistema **DEBE** fallar y reportar el error.
* **Prohibido**: Crear registros "genéricos" o temporales en segundo plano para evitar que la UI falle.
* **Justificación**: El self-healing oculta bugs de persistencia y crea inconsistencias a largo plazo.

## 2. Gestión Centralizada de Errores

Todos los fallos del backend deben ser procesados por un controlador de excepciones global.

* **Regla**: Las excepciones de Java deben ser capturadas por `GlobalExceptionHandler.java`.
* **Formato**: Los errores devueltos al frontend deben ser JSON limpios: `{ "error": "Mensaje legible", "type": "TipoDeExcepcion" }`.
* **Limpieza**: Se debe eliminar el ruido técnico (timestamps excesivos, líneas divisoras `---`, stack traces crudos) de las respuestas enviadas al cliente.

## 3. Jerarquía Plana de la Biblia

La organización de lore debe seguir una estructura simple y predecible.

* **Estructura**: `Root` -> `Carpeta` -> `Entidad`.
* **Restricción**: No se permite la creación de subcarpetas redundantes dentro del explorador de la Biblia para evitar la fragmentación del lore.
* **CRUD**: La creación de entidades (Personajes, Mapas, etc.) se realiza directamente dentro de la carpeta contenedora.

## 4. Gestión Estricta de Tenant (Contexto de Proyecto)

El aislamiento de datos es primordial.

* **Regla**: Todo acceso a los repositorios debe estar precedido por la validación del `proyectoActivo` en la sesión y la configuración del `TenantContext`.
* **Prohibido**: Uso de valores por defecto hardcoded (ej: "Prime World") si el contexto es nulo.
* **Seguridad**: Si no hay un proyecto seleccionado explícitamente, la API debe devolver `401 Unauthorized` o `404 Not Found`.

## 5. Persistencia y Sincronización

* **Flyway**: Todas las modificaciones del esquema deben pasar por migraciones versionadas.
* **Integridad**: Antes de guardar cualquier entidad, el controlador debe verificar que el `Cuaderno` padre existe y es válido.

## 6. Directiva de Idioma y Comunicación

La comunicación con el usuario y la documentación principal deben ser claras y en su idioma nativo.

* **Regla**: Toda respuesta, plan de implementación, explicación y artefacto dirigido al usuario debe estar redactado en **ESPAÑOL**.
* **Excepción**: El código fuente, nombres de variables y mensajes de log técnicos deben mantenerse en inglés puros para preservar estándares de la industria, a menos que el usuario indique lo contrario para textos visibles en UI.

---

## 7. Estándares de Frontend (Rutas y Diseño)

Para garantizar portabilidad y diseño responsive coherente:

* **Rutas**: Se DEBEN usar rutas relativas siempre que sea posible (ej: `./assets/img.png`, `../components/Header`). Evitar rutas absolutas hardcoded que dependan del dominio raíz.
* **CSS**: Se DEBEN usar unidades relativas (`rem`, `em`, `%`) para espaciados, fuentes y tamaños. Evitar `px` salvo para bordes finos o casos estrictamente necesarios.

---

## 8. Seguridad de Lazy Loading (Hibernate)

* **Problema**: La serialización de objetos con relaciones `Lazy` fuera de una transacción causa errores 500 (`LazyInitializationException`).
* **Regla**: **PROHIBIDO** devolver entidades JPA crudas directamente desde el Controlador si tienen relaciones Lazy no inicializadas.
* **Solución**: Usar siempre un helper de hidratación (ej: `hydrateEntity`) dentro del Servicio `@Transactional` para inicializar explícitamente (`Hibernate.initialize()`) todas las relaciones necesarias antes de retornar el objeto.

---

## 9. Especialización de Agentes (Meta-Regla)

* **Principio**: Divide y Vencerás.
* **Regla**: El sistema NO debe actuar como un generalista monolítico. Debe invocar o simular "Agentes Especializados" según la naturaleza de la tarea o la regla a aplicar (ej: "Agente de Persistencia" para fixes de BBDD, "Agente de UI" para diseño, "Auditor de Reglas" para verificación).
* **Justificación**: Aumenta la precisión y reduce el riesgo de alucinaciones o mezclas de contexto.

---

*Última actualización: 2026-01-26 (Añadido Especialización de Agentes)*
