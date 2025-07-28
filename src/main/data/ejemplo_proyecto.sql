-- ===========================================
-- PROYECTO: Mi Mundo Fantástico
-- ENFOQUE: fantasia
-- FECHA DE CREACIÓN: 2024-01-15T10:30:45
-- ===========================================

-- REFERENCIA A LA BASE DE DATOS GENERAL
-- Este archivo usa worldbuilding.sql como base
-- Las tablas y funciones están definidas en worldbuilding.sql

use worldbuilding;

-- ===========================================
-- OPERACIONES ESPECÍFICAS DEL PROYECTO: Mi Mundo Fantástico
-- ===========================================

-- Crear el proyecto en la base de datos
INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('Mi Mundo Fantástico', 'fantasia');

-- ===========================================
-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO
-- ===========================================

-- Ejemplos de operaciones que se pueden agregar:
-- INSERT INTO entidadIndividual (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES (...);
-- INSERT INTO construccion (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO zona (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO efectos (nombre, apellidos, origen, dureza, comportamiento, descripcion) VALUES (...);
-- INSERT INTO interaccion (nombre, apellidos, direccion, tipo, afectados, descripcion) VALUES (...);

-- Operación agregada: 2024-01-15T10:35:22
INSERT INTO entidadIndividual (nombre, apellidos, tipo, descripcion, estado, origen, comportamiento) VALUES ('Gandalf', 'el Gris', 'inmortal', 'Un poderoso mago que protege la Tierra Media', 'activo', 'ficticio', 'activo');

-- Operación agregada: 2024-01-15T10:40:15
INSERT INTO construccion (nombre, apellidos, tipo, descripcion, tamanno, desarrollo) VALUES ('Minas Tirith', 'de Gondor', 'artificial', 'La capital de Gondor, una ciudad imponente', 'Grande', 'Extensión de una construcción');

-- Operación agregada: 2024-01-15T10:45:30
INSERT INTO zona (nombre, apellidos, tipo, descripcion, tamanno, desarrollo) VALUES ('Mordor', 'Tierra Oscura', 'natural', 'Una tierra desolada gobernada por el Señor Oscuro', 'Grande', 'Extensión de una zona');

-- Operación agregada: 2024-01-15T10:50:12
INSERT INTO efectos (nombre, apellidos, tipo, descripcion, origen, dureza, comportamiento) VALUES ('El Anillo Único', 'de Sauron', 'efecto', 'Un anillo que otorga poder pero corrompe', 'magia', 'duro', 'activo');

-- Operación agregada: 2024-01-15T10:55:45
INSERT INTO interaccion (nombre, apellidos, tipo, descripcion, direccion, afectados) VALUES ('Guerra del Anillo', 'Gran Conflicto', 'relacion', 'La lucha por el control del Anillo Único', 'bidireccional', 'ambos'); 