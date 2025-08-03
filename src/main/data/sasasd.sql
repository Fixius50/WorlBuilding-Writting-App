-- ===========================================
-- PROYECTO: sasasd
-- ENFOQUE: Escribir Novelas
-- FECHA DE CREACIÓN: 2025-08-03T16:40:32.394036
-- ===========================================

-- REFERENCIA A LA BASE DE DATOS GENERAL
-- Este archivo usa worldbuilding.sql como base
-- Las tablas y funciones están definidas en worldbuilding.sql

use worldbuilding;

-- ===========================================
-- OPERACIONES ESPECÍFICAS DEL PROYECTO: sasasd
-- ===========================================

-- Crear el proyecto en la base de datos
INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('sasasd', 'Escribir Novelas');

-- ===========================================
-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO
-- ===========================================

-- Ejemplos de operaciones que se pueden agregar:
-- INSERT INTO entidadIndividual (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES (...);
-- INSERT INTO construccion (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO zona (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO efectos (nombre, apellidos, origen, dureza, comportamiento, descripcion) VALUES (...);
-- INSERT INTO interaccion (nombre, apellidos, direccion, tipo, afectados, descripcion) VALUES (...);

