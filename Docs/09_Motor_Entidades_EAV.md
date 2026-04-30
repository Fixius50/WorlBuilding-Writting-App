# 09. Motor de Entidades Multiversal (EAV)

## Visión General

El **Motor de Entidades Multiversal** es una implementación avanzada del patrón **EAV (Entity-Attribute-Value)** diseñada para permitir que cada proyecto de worldbuilding defina sus propias leyes físicas, sociales y metafísicas sin alterar el esquema fijo de la base de datos.

## 1. Arquitectura de Datos (SQLite)

El sistema se apoya en tres pilares fundamentales dentro de `localDB`:

### A) Tabla `plantillas` (Definición de Atributos)
Define qué tipo de datos se pueden recolectar.
- `id`: Identificador único.
- `nombre`: Etiqueta del campo (ej: "Nivel de Magia").
- `tipo`: Tipo de input (`text`, `number`, `date`, `boolean`, `long_text`).
- `aplica_a_todo`: Booleano que define si el atributo es Global.
- `tipo_objetivo`: Si no es global, especifica a qué tipo de entidad aplica (`PERSONAJE`, `LUGAR`, etc.).
- `categoria`: Agrupador visual para el formulario (ej: "Biografía", "Combate").
- `orden`: Posicionamiento relativo en la UI.

### B) Tabla `valores` (Instanciación)
Almacena los datos específicos de cada entidad.
- `entidad_id`: FK a la entidad.
- `plantilla_id`: FK a la definición del atributo.
- `valor`: El dato almacenado (serializado como string).

---

## 2. Componentes del Sistema

### El Taller (`ArchetypeManager`)
Es el panel de control administrativo. Permite al usuario "esculpir" la estructura de su mundo.
- **Acceso**: `/workshop`.
- **Funcionalidad**: CRUD de plantillas con previsualización de tipos de datos.

### Gestor Masivo (`BibleTableView`)
Una interfaz de alto rendimiento para usuarios avanzados.
- **Tecnología**: `@tanstack/react-table`.
- **Ráfaga de Creación**: Permite poblar la Biblia del Mundo mediante una fila de inserción rápida que mantiene el foco, ideal para sesiones de "brainstorming" masivo.
- **Layout**: Integrado en `WorldBibleLayout` mediante un conmutador de vista flotante.

### Formulario Dinámico (`DynamicAttributeForm`)
Motor de inyección de campos.
- **Lógica de Inyección**: Al cargar una entidad, el motor busca todas las plantillas globales + las plantillas específicas del tipo de la entidad.
- **UX**: Guardado automático mediante *Debounced Updates* o *Blur Events* para una experiencia fluida sin botones de "Guardar".

---

## 3. Patrones de Implementación

### Servicio de Entidades (`entityService`)
El método `getValues(entityId)` realiza un `JOIN` complejo para recuperar tanto el valor actual como la definición de la plantilla, permitiendo que la UI sepa cómo renderizar cada campo dinámicamente.

```typescript
// Estructura de retorno de getValues
{
  id: number;
  valor: string;
  plantilla: {
    nombre: string;
    tipo: string;
    categoria: string;
    // ...etc
  }
}
```

### Gestión de Arquetipos
Los arquetipos no son clases rígidas, sino conjuntos de atributos. Esto permite que una entidad evolucione orgánicamente. Si el usuario cambia el tipo de una entidad (ej: de `PERSONAJE` a `LUGAR`), los atributos específicos de Personaje se ocultarán pero no se borrarán de la base de datos, manteniendo la integridad del lore.

---

## 4. Próximos Pasos (Evolución)

1. **Campos de Referencia**: Atributos que permitan seleccionar otra entidad (ej: "Padre", "Localización Actual").
2. **Validaciones Avanzadas**: Regex personalizados para atributos de tipo texto.
3. **Cálculos Automáticos**: Atributos derivados de otros campos (ej: "Edad" calculada desde "Fecha de Nacimiento" y "Año Actual del Mundo").
