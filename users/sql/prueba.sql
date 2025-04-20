create database if not EXISTS prueba;

CREATE TABLE usuario(
	nombre VARCHAR(10) PRIMARY KEY,
	apellido varchar(10)
);

insert into usuario values("Pepito", "Perez");

select * from usuario;