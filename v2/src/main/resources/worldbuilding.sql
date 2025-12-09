-- WorldbuildingApp V2 - Script de Procedimientos Almacenados
-- Este script se ejecuta automáticamente al arrancar Spring Boot.
-- Las TABLAS son creadas por Hibernate (JPA), aquí solo van Funciones y Procedimientos.

-- Eliminar si existen para evitar errores en re-ejecuciones
DROP FUNCTION IF EXISTS abrirProyecto //
DROP PROCEDURE IF EXISTS activarNodo //
DROP PROCEDURE IF EXISTS relacionarPorCaracteristica //
DROP PROCEDURE IF EXISTS verRelacionados //

-- Función para verificar si un proyecto existe
CREATE FUNCTION abrirProyecto(nombre VARCHAR(100))
    RETURNS BOOLEAN
    DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;
    SELECT COUNT(*) > 0 INTO existe
    FROM proyecto
    WHERE nombre_proyecto = nombre;
    RETURN existe;
END //

-- Procedimiento para activar un nodo
CREATE PROCEDURE activarNodo(
    IN entidadID BIGINT,
    IN tipoEntidad VARCHAR(100),
    IN caracteristica VARCHAR(100)
)
BEGIN
    DECLARE existe INT;

    -- Verifica si ya existe como nodo
    SELECT COUNT(*) INTO existe
    FROM nodo
    WHERE entidad_id = entidadID AND tipo_entidad = tipoEntidad;

    -- Si no existe, lo inserta
    IF existe = 0 THEN
        INSERT INTO nodo (entidad_id, tipo_entidad, caracteristica_relacional)
        VALUES (entidadID, tipoEntidad, caracteristica);
    END IF;

    -- Actualiza la tabla de origen para marcarlo como nodo
    SET @sql = CONCAT('UPDATE ', tipoEntidad, ' SET es_nodo = TRUE WHERE id = ', entidadID);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

-- Procedimiento para relacionar nodos con la misma característica
CREATE PROCEDURE relacionarPorCaracteristica(
    IN caracteristica VARCHAR(100),
    IN tipoRelacion VARCHAR(100)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE id1 BIGINT;
    DECLARE id2 BIGINT;

    DECLARE cur1 CURSOR FOR
        SELECT n1.id AS id1, n2.id AS id2
        FROM nodo n1
        JOIN nodo n2 ON n1.caracteristica_relacional = n2.caracteristica_relacional
        WHERE n1.id < n2.id AND n1.caracteristica_relacional = caracteristica;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur1;

    read_loop: LOOP
        FETCH cur1 INTO id1, id2;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Inserta relación si no existe aún
        INSERT INTO relacion (nodo_origen_id, nodo_destino_id, tipo_relacion)
        SELECT id1, id2, tipoRelacion
        FROM DUAL
        WHERE NOT EXISTS (
            SELECT 1 FROM relacion
            WHERE nodo_origen_id = id1 AND nodo_destino_id = id2
        );
    END LOOP;

    CLOSE cur1;
END //

-- Procedimiento para ver nodos relacionados
CREATE PROCEDURE verRelacionados(
    IN nodoID BIGINT
)
BEGIN
    SELECT r.id AS relacion_id,
           n.id AS nodo_relacionado_id,
           n.entidad_id,
           n.tipo_entidad,
           n.caracteristica_relacional,
           r.tipo_relacion
    FROM relacion r
    JOIN nodo n ON (
        (r.nodo_origen_id = nodoID AND n.id = r.nodo_destino_id)
        OR
        (r.nodo_destino_id = nodoID AND n.id = r.nodo_origen_id)
    );
END //
