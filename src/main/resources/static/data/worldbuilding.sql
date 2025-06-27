create database if not exists worldbuilding;
use worldbuilding;

/*
Esta es la base de datos general para todas. Tmabién se le declaran los valores y cosas 
que necesita el proyecto en general.
*/

create table if not exists crearProyecto(
	nombreProyecto varchar(100) not null Primary Key,
	enfoqueProyecto varchar(10) not null
);

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

Insert into crearProyecto values ('HolaMundo', 'programa');

select * from crearProyecto;