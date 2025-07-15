create database if not exists worldbuilding;
use worldbuilding;

/*
Esta es la base de datos general para todas. Tmabién se le declaran los valores y cosas 
que necesita el proyecto en general.
*/

-- Esta tabla crea el proyecto.
create table if not exists crearProyecto(
	nombreProyecto varchar(100) not null Primary Key,
	enfoqueProyecto varchar(10) not null
);

-- Esta función abre el proyecto. Esta contenida en un delimitador ya que el proyecto puede no existir.
DELIMITER $$
	CREATE FUNCTION abrirProyecto(nombre VARCHAR(100))
	RETURNS BOOLEAN
	DETERMINISTIC
	BEGIN
		DECLARE existe BOOLEAN;

			SELECT COUNT(*) > 0 INTO existe
			FROM crearProyecto
			WHERE nombreProyecto = nombre;

		RETURN existe;
	END 
$$ DELIMITER ;

/*
	Estas tablas de abajo son las referentes a la pestaña de creación.
*/

create table if not exists crearEntidadIndividual(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	estado varchar(100) not null,
	tipo varchar(100) not null,
	origen varchar(100) not null,
	comportamiento varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

create table if not exists crearEntidadColectiva(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	estado varchar(100) not null,
	tipo varchar(100) not null,
	origen varchar(100) not null,
	comportamiento varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

create table if not exists efectos(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	origen varchar(100) not null,
	dureza varchar(100) not null,
	comportamiento varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

create table if not exists construccion(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	tamaño varchar(100) not null,
	tipo varchar(100) not null,
	desarrollo varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

create table if not exists zona(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	tamaño varchar(100) not null,
	tipo varchar(100) not null,
	desarrollo varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

create table if not exists interaccion(
	nombre varchar(100) not null,
	apellidos varchar(100) not null,
	direccion varchar(100) not null,
	tipoDeDireccion varchar(100) not null,
	numeroDeAfectados varchar(100) not null,
	descripcion MEDIUMTEXT -- O también sirve LONGTEXT o TEXT según se vaya viendo
);

/*
	Estas funciones de abajo son las referentes a la pestaña de creación.
	Todas devuelven un valor booleano; TRUE = se ha hecho correctamente || FALSE = había un error y no se hizo.
	Para acceder a cada una de las funciones, se pone CALL nombreFunción('valor1', 'valorN');
*/

-- Entidades individuales:

DELIMITER $$

CREATE PROCEDURE crearEntidadIndividual(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN estado VARCHAR(100),
    IN tipo VARCHAR(100),
    IN origen VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND estado IS NOT NULL AND
       tipo IS NOT NULL AND origen IS NOT NULL AND comportamiento IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO entidad_individual (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion)
        VALUES (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verEntidadIndividual(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN estado VARCHAR(100),
    IN tipo VARCHAR(100),
    IN origen VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM entidad_individual
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          estado = estado AND
          tipo = tipo AND
          origen = origen AND
          comportamiento = comportamiento AND
          descripcion = descripcion;
END$$

DELIMITER ;

-- Entidades colectivas:

DELIMITER $$

CREATE PROCEDURE crearEntidadColectiva(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN estado VARCHAR(100),
    IN tipo VARCHAR(100),
    IN origen VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND estado IS NOT NULL AND
       tipo IS NOT NULL AND origen IS NOT NULL AND comportamiento IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO entidad_colectiva (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion)
        VALUES (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verEntidadColectiva(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN estado VARCHAR(100),
    IN tipo VARCHAR(100),
    IN origen VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM entidad_colectiva
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          estado = estado AND
          tipo = tipo AND
          origen = origen AND
          comportamiento = comportamiento AND
          descripcion = descripcion;
END$$

DELIMITER ;

-- Efectos:

DELIMITER $$

CREATE PROCEDURE crearEfectos(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN origen VARCHAR(100),
    IN dureza VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND origen IS NOT NULL AND
       dureza IS NOT NULL AND comportamiento IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO efectos (nombre, apellidos, origen, dureza, comportamiento, descripcion)
        VALUES (nombre, apellidos, origen, dureza, comportamiento, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verEfectos(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN origen VARCHAR(100),
    IN dureza VARCHAR(100),
    IN comportamiento VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM efectos
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          origen = origen AND
          dureza = dureza AND
          comportamiento = comportamiento AND
          descripcion = descripcion;
END$$

DELIMITER ;

-- Construcciones:

DELIMITER $$

CREATE PROCEDURE crearConstruccion(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN tamaño VARCHAR(100),
    IN tipo VARCHAR(100),
    IN desarrollo VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND tamaño IS NOT NULL AND
       tipo IS NOT NULL AND desarrollo IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO construccion (nombre, apellidos, tamaño, tipo, desarrollo, descripcion)
        VALUES (nombre, apellidos, tamaño, tipo, desarrollo, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verConstruccion(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN tamaño VARCHAR(100),
    IN tipo VARCHAR(100),
    IN desarrollo VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM construccion
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          tamaño = tamaño AND
          tipo = tipo AND
          desarrollo = desarrollo AND
          descripcion = descripcion;
END$$

DELIMITER ;

-- Zonas:

DELIMITER $$

CREATE PROCEDURE crearZona(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN tamaño VARCHAR(100),
    IN tipo VARCHAR(100),
    IN desarrollo VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND tamaño IS NOT NULL AND
       tipo IS NOT NULL AND desarrollo IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO zona (nombre, apellidos, tamaño, tipo, desarrollo, descripcion)
        VALUES (nombre, apellidos, tamaño, tipo, desarrollo, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verZona(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN tamaño VARCHAR(100),
    IN tipo VARCHAR(100),
    IN desarrollo VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM zona
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          tamaño = tamaño AND
          tipo = tipo AND
          desarrollo = desarrollo AND
          descripcion = descripcion;
END$$

DELIMITER ;

-- Interacciones:

DELIMITER $$

CREATE PROCEDURE crearInteraccion(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN direccion VARCHAR(100),
    IN tipoDeDireccion VARCHAR(100),
    IN numeroDeAfectados VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    IF nombre IS NOT NULL AND apellidos IS NOT NULL AND direccion IS NOT NULL AND
       tipoDeDireccion IS NOT NULL AND numeroDeAfectados IS NOT NULL AND descripcion IS NOT NULL THEN
        INSERT INTO interaccion (nombre, apellidos, direccion, tipoDeDireccion, numeroDeAfectados, descripcion)
        VALUES (nombre, apellidos, direccion, tipoDeDireccion, numeroDeAfectados, descripcion);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE verInteraccion(
    IN nombre VARCHAR(100),
    IN apellidos VARCHAR(100),
    IN direccion VARCHAR(100),
    IN tipoDeDireccion VARCHAR(100),
    IN numeroDeAfectados VARCHAR(100),
    IN descripcion MEDIUMTEXT
)
BEGIN
    SELECT *
    FROM interaccion
    WHERE nombre = nombre AND
          apellidos = apellidos AND
          direccion = direccion AND
          tipoDeDireccion = tipoDeDireccion AND
          numeroDeAfectados = numeroDeAfectados AND
          descripcion = descripcion;
END$$

DELIMITER ;

/*
A partir de aquí son las cosas de los nodos y enlaces dentro del mapa del proyecto.
Funciona de manera que cada tabla lleva un nodo desactivado. El usuario decide activarlo cuando lo vaya a enlazar con otro nodo
*/

-- Añadimos una columna de nodos a cada tabla:

ALTER TABLE construccion ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;
ALTER TABLE efectos ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;
ALTER TABLE interaccion ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;
ALTER TABLE zona ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;
ALTER TABLE crearEntidadColectiva ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;
ALTER TABLE crearEntidadIndividual ADD COLUMN es_nodo BOOLEAN DEFAULT FALSE;

-- Tabla de nodos

CREATE TABLE nodo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entidad_id INT NOT NULL,
    tipo_entidad VARCHAR(100) NOT NULL,
    caracteristica_relacional VARCHAR(100), -- definida por el usuario
    UNIQUE(tipo_entidad, entidad_id)
);

/*Aquí tipo_entidad puede ser por ejemplo "zona", "efecto", "interaccion", etc.
La caracteristica_relacional es la etiqueta que permite agrupar o relacionar nodos.*/

-- Tabla de relaciones

CREATE TABLE relacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nodo_origen_id INT NOT NULL,
    nodo_destino_id INT NOT NULL,
    tipo_relacion VARCHAR(100), -- definida por el usuario
    FOREIGN KEY (nodo_origen_id) REFERENCES nodo(id) ON DELETE CASCADE,
    FOREIGN KEY (nodo_destino_id) REFERENCES nodo(id) ON DELETE CASCADE
);

/*

-- Ejemplo de como se hace:

UPDATE zona SET es_nodo = TRUE WHERE id = 5;

INSERT INTO nodo (entidad_id, tipo_entidad, caracteristica_relacional)
VALUES (5, 'zona', 'peligroso');

UPDATE construccion SET es_nodo = TRUE WHERE id = 2;

INSERT INTO nodo (entidad_id, tipo_entidad, caracteristica_relacional)
VALUES (2, 'construccion', 'peligroso');

-- Relación directa:

INSERT INTO relacion (nodo_origen_id, nodo_destino_id, tipo_relacion)
VALUES (1, 2, 'comparten_peligro');

*/

-- Procedimiento para activar un nodo:

DELIMITER $$

CREATE PROCEDURE activarNodo(
    IN entidadID INT,
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
END$$

DELIMITER ;

-- Procedimiento para relacionar nodos con la misma característica:

DELIMITER $$

CREATE PROCEDURE relacionarPorCaracteristica(
    IN caracteristica VARCHAR(100),
    IN tipoRelacion VARCHAR(100)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE id1 INT;
    DECLARE id2 INT;

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
END$$

DELIMITER ;

-- Procedimiento para ver nodos relacionados:

DELIMITER $$

CREATE PROCEDURE verRelacionados(
    IN nodoID INT
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
END$$

DELIMITER ;

/*
-- Ejemplo de como usarlo:

CALL activarNodo(3, 'zona', 'contaminacion');
CALL activarNodo(7, 'construccion', 'contaminacion');

CALL relacionarPorCaracteristica('contaminacion', 'vinculo_logico');

CALL verRelacionados(1); -- Suponiendo que el nodo 1 es uno de los anteriores

*/