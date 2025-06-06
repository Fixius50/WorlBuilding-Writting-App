-- Active: 1749219000376@@127.0.0.1@3306
-- Base de datos de la primera página llamada "menuInicialLog". 
CREATE TABLE USUARIO (
    nombre TEXT PRIMARY KEY NOT NULL,
    apellido TEXT,
    identificadorUsuario INTEGER
);

INSERT INTO USUARIO (nombre, apellido, identificadorUsuario) VALUES ('Pepito', 'Perez', NULL);

SELECT * FROM USUARIO;

-- Aquí se devuelven/comprueban los resultados
select * from usuario;

-- Mirar si hacer triggers y manejadores de eventos, cuando la BBDD crezca