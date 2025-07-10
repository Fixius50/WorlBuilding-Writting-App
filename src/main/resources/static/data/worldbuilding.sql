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
*/

-- Entidad Individual
DELIMITER $$
	CREATE FUNCTION crearEntidadIndividual(nombre varchar(100), apellidos varchar(100), 
											estado varchar(100), tipo varchar(100), 
											origen varchar(100), comportamiento varchar(100), 
											descripcion MEDIUMTEXT)
	RETURNS BOOLEAN
	DETERMINISTIC
	BEGIN
		DECLARE existe BOOLEAN;

		IF nombre IS NULL OR apellidos IS NULL OR estado IS NULL OR tipo IS NULL OR 
		origen IS NULL OR comportamiento IS NULL OR descripcion IS NULL THEN
			SET existe = FALSE;
		ELSE
			SELECT COUNT(*) > 0 INTO existe
			FROM entidad_individual
			WHERE nombre = nombre AND
				apellidos = apellidos AND
				estado = estado AND
				tipo = tipo AND
				origen = origen AND
				comportamiento = comportamiento AND
				descripcion = descripcion;
		END IF;

		RETURN existe;
	END
$$ DELIMITER ;

-- Entidad Colectiva

DELIMITER $$

CREATE FUNCTION crearEntidadColectiva(nombre VARCHAR(100), apellidos VARCHAR(100), 
                                      estado VARCHAR(100), tipo VARCHAR(100), 
                                      origen VARCHAR(100), comportamiento VARCHAR(100), 
                                      descripcion MEDIUMTEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;

    IF nombre IS NULL OR apellidos IS NULL OR estado IS NULL OR tipo IS NULL OR 
       origen IS NULL OR comportamiento IS NULL OR descripcion IS NULL THEN
        SET existe = FALSE;
    ELSE
        SELECT COUNT(*) > 0 INTO existe
        FROM crearEntidadColectiva
        WHERE nombre = nombre AND
              apellidos = apellidos AND
              estado = estado AND
              tipo = tipo AND
              origen = origen AND
              comportamiento = comportamiento AND
              descripcion = descripcion;
    END IF;

    RETURN existe;
END
$$ DELIMITER ;

-- Efectos

DELIMITER $$

CREATE FUNCTION crearEfectos(nombre VARCHAR(100), apellidos VARCHAR(100), 
                             origen VARCHAR(100), dureza VARCHAR(100), 
                             comportamiento VARCHAR(100), descripcion MEDIUMTEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;

    IF nombre IS NULL OR apellidos IS NULL OR origen IS NULL OR dureza IS NULL OR 
       comportamiento IS NULL OR descripcion IS NULL THEN
        SET existe = FALSE;
    ELSE
        SELECT COUNT(*) > 0 INTO existe
        FROM efectos
        WHERE nombre = nombre AND
              apellidos = apellidos AND
              origen = origen AND
              dureza = dureza AND
              comportamiento = comportamiento AND
              descripcion = descripcion;
    END IF;

    RETURN existe;
END
$$ DELIMITER ;

-- Construccion

DELIMITER $$

CREATE FUNCTION crearConstruccion(nombre VARCHAR(100), apellidos VARCHAR(100), 
                                  tamaño VARCHAR(100), tipo VARCHAR(100), 
                                  desarrollo VARCHAR(100), descripcion MEDIUMTEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;

    IF nombre IS NULL OR apellidos IS NULL OR tamaño IS NULL OR tipo IS NULL OR 
       desarrollo IS NULL OR descripcion IS NULL THEN
        SET existe = FALSE;
    ELSE
        SELECT COUNT(*) > 0 INTO existe
        FROM construccion
        WHERE nombre = nombre AND
              apellidos = apellidos AND
              tamaño = tamaño AND
              tipo = tipo AND
              desarrollo = desarrollo AND
              descripcion = descripcion;
    END IF;

    RETURN existe;
END
$$ DELIMITER ;

-- Zona

DELIMITER $$

CREATE FUNCTION crearZona(nombre VARCHAR(100), apellidos VARCHAR(100), 
                          tamaño VARCHAR(100), tipo VARCHAR(100), 
                          desarrollo VARCHAR(100), descripcion MEDIUMTEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;

    IF nombre IS NULL OR apellidos IS NULL OR tamaño IS NULL OR tipo IS NULL OR 
       desarrollo IS NULL OR descripcion IS NULL THEN
        SET existe = FALSE;
    ELSE
        SELECT COUNT(*) > 0 INTO existe
        FROM zona
        WHERE nombre = nombre AND
              apellidos = apellidos AND
              tamaño = tamaño AND
              tipo = tipo AND
              desarrollo = desarrollo AND
              descripcion = descripcion;
    END IF;

    RETURN existe;
END
$$ DELIMITER ;

-- Interacción

DELIMITER $$

CREATE FUNCTION crearInteraccion(nombre VARCHAR(100), apellidos VARCHAR(100), 
                                 direccion VARCHAR(100), tipoDeDireccion VARCHAR(100), 
                                 numeroDeAfectados VARCHAR(100), descripcion MEDIUMTEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existe BOOLEAN;

    IF nombre IS NULL OR apellidos IS NULL OR direccion IS NULL OR tipoDeDireccion IS NULL OR 
       numeroDeAfectados IS NULL OR descripcion IS NULL THEN
        SET existe = FALSE;
    ELSE
        SELECT COUNT(*) > 0 INTO existe
        FROM interaccion
        WHERE nombre = nombre AND
              apellidos = apellidos AND
              direccion = direccion AND
              tipoDeDireccion = tipoDeDireccion AND
              numeroDeAfectados = numeroDeAfectados AND
              descripcion = descripcion;
    END IF;

    RETURN existe;
END
$$ DELIMITER ;