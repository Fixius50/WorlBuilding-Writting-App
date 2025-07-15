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