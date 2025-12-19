# Bitácora de Desarrollo (Log Prompts)

---

### Prompt ID: 0 (Setup Inicial)
> Analizame la app WorldbuildingApp y todas sus versiones... serverless pero con funcionamiento en el explorador...
**Resultados:**
*   [ANÁLISIS] Determinada estructura (v1/v2 Java, v3 Next.js).
*   [ESTRATEGIA] Migración exitosa a Java Spring Boot + H2 (standalone).

---

### Prompt ID: 3 (Estructura de Cuadernos)
> ...cuaderno/libro... plantillas/hojas... numerando las hojas...
**Resultados:**
*   [DOCS] Definida jerarquía Librería -> Cuaderno -> Hoja en `manifiesto.md`.

---

### Prompt ID: 4 (Rediseño Visual)
> Me gustaria cambiar totalmente el diseño visual y de colores de la interfaz. Despues prueba la app y verifica que todo va.
**Resultados:**
*   [DISEÑO] Propuesto sistema "The Alchemist's Study" (Parchment, Gold, Dark Ink).
*   [DOCS] Actualizado `manifiesto.md` con las nuevas especificaciones visuales.

---

### Prompt ID: 5 (Corrección de Creación de Entidades)
> ...fallos al crear alguna cosa como una entidad...
**Resultados:**
*   [BUG FIX] Corregido error en `DynamicDataSourceConfig`: el inicializador SQL ignoraba bloques que empezaban con comentarios, omitiendo la creación de tablas.
*   [COMPATIBILIDAD] Cambiado `MEDIUMTEXT` por `CLOB` en todas las entidades para asegurar compatibilidad total con H2.
*   [VERIFICACIÓN] Verificado flujo completo en un nuevo proyecto "Mundo_Arreglado".


### Prompt ID: 6 (Navegación y Arquitectura)
> Elimina la sidebar, pon un menú radial arriba y prepara el backend para multi-usuario...
**Resultados:**
*   [UX] Implementado menú radial Top-Center (Glassmorphism). Refactorizados todos los HTMLs.
*   [BACKEND] Creada entidad Usuario y repositorio JPA. Configurado redirección a Login.

---

### Prompt ID: 7 (Migraci�n a SQLite)
> Migrate to SQLite Database
**Resultados:**
*   [DATABASE] Migraci�n completa de H2 a SQLite (data/worldbuilding.db).
*   [CLEANUP] Eliminado c�digo legacy H2 (DynamicDataSourceConfig, H2Functions).
*   [REFACTOR] Reescritura de ProyectoController y BDController para JPA est�ndar.

