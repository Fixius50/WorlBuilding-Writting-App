-- =====================================================
-- WorldbuildingApp V2 - Procedimientos para H2
-- Funciones y procedimientos almacenados
-- =====================================================

-- Nota: H2 tiene sintaxis diferente a MySQL para procedimientos.
-- Usamos funciones definidas por el usuario (Alias) en su lugar.

-- Función para verificar si existe un proyecto (por metadatos internos)
CREATE ALIAS IF NOT EXISTS PROYECTO_EXISTE FOR "com.worldbuilding.app.h2.H2Functions.proyectoExiste";

-- Función para activar un nodo
CREATE ALIAS IF NOT EXISTS ACTIVAR_NODO FOR "com.worldbuilding.app.h2.H2Functions.activarNodo";

-- Función para relacionar nodos por característica
CREATE ALIAS IF NOT EXISTS RELACIONAR_POR_CARACTERISTICA FOR "com.worldbuilding.app.h2.H2Functions.relacionarPorCaracteristica";
