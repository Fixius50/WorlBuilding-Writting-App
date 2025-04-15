-- Base de datos de la primera página llamada "menuInicialLog". 
create database if not EXISTS menuInicialLog;
use menuInicialLog;

-- Aquí se recogen los valores de las dos pestañas para seleccionar que son enviados a través de Java
CREATE TABLE usuario(
	nombre VARCHAR(10) PRIMARY KEY,
	apellido varchar(10),
    identificadorUsuario INT
);

-- Aquí se seleccionan qué valores van a ser añadidos
insert into usuario values("Pepito", "Perez", null);

-- Aquí se devuelven/comprueban los resultados
select * from usuario;

-- Mirar si hacer triggers y manejadores de eventos, cuando la BBDD crezca