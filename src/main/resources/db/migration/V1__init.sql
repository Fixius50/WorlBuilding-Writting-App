-- V1__init.sql Generated from Hibernate Schema

CREATE TABLE atributo_plantilla (es_obligatorio boolean, global BOOLEAN DEFAULT false, orden_visual integer, carpeta_id bigint not null, id bigint, descripcion CLOB, metadata CLOB, nombre varchar(255) not null, tipo varchar(255) not null, valor_defecto CLOB, primary key (id));

CREATE TABLE atributo_valor (entidad_id bigint not null, id bigint, plantilla_id bigint not null, valor CLOB, primary key (id));

CREATE TABLE carpeta (deleted BOOLEAN DEFAULT false, deleted_date timestamp, id bigint, padre_id bigint, proyecto_id bigint not null, descripcion varchar(255), nombre varchar(255) not null, slug varchar(255), tipo varchar(255), primary key (id));

CREATE TABLE conlang (fecha_creacion timestamp, id bigint, descripcion CLOB, fonologia CLOB, font_family_name varchar(255), gramatica CLOB, nombre varchar(255) not null, nombre_proyecto varchar(255), primary key (id));

CREATE TABLE conlang_lexemes (created_at timestamp, id bigint, project_id bigint, description TEXT, gloss varchar(255) not null, ipa_pronunciation varchar(255) not null, raster_image_path varchar(255), svg_path_data TEXT, primary key (id));

CREATE TABLE conlang_rules (priority integer not null, conlang_id bigint, id bigint, regex_pattern varchar(255) not null, replacement_pattern varchar(255) not null, rule_name varchar(255) not null, primary key (id));

CREATE TABLE conlang_settings (id bigint, project_id bigint unique, font_family_name varchar(255), language_name varchar(255), primary key (id));

CREATE TABLE construccion (deleted BOOLEAN DEFAULT false, es_nodo boolean, deleted_date timestamp, id bigint, desarrollo varchar(255), descripcion CLOB, nombre varchar(255), nombre_proyecto varchar(255), tipo_edificio varchar(255), primary key (id));

CREATE TABLE cuaderno (deleted BOOLEAN DEFAULT false, deleted_date timestamp, fecha_creacion timestamp, id bigint, descripcion CLOB, genero varchar(255), imagen_url varchar(255), nombre_proyecto varchar(255) not null, tipo varchar(255), titulo varchar(255) not null, primary key (id));

CREATE TABLE efectos (deleted BOOLEAN DEFAULT false, es_nodo boolean, deleted_date timestamp, id bigint, alcance varchar(255), descripcion CLOB, nombre varchar(255), nombre_proyecto varchar(255), origen varchar(255), tipo_efecto varchar(255), primary key (id));

CREATE TABLE entidad_colectiva (cantidad_miembros integer, deleted BOOLEAN DEFAULT false, es_nodo boolean, deleted_date timestamp, id bigint, comportamiento varchar(255), descripcion CLOB, nombre varchar(255), nombre_proyecto varchar(255), tipo varchar(255), primary key (id));

CREATE TABLE entidad_generica (deleted BOOLEAN DEFAULT false, favorite boolean, carpeta_id bigint not null, deleted_date timestamp, id bigint, proyecto_id bigint not null, apariencia TEXT, categoria varchar(255), color varchar(255), descripcion TEXT, icon_url TEXT, nombre varchar(255) not null, notas TEXT, slug varchar(255), tags varchar(255), tipo_especial varchar(255), primary key (id));

CREATE TABLE entidad_individual (deleted BOOLEAN DEFAULT false, es_nodo boolean, deleted_date timestamp, id bigint, apellidos varchar(255), comportamiento varchar(255), descripcion CLOB, estado varchar(255), nombre varchar(255), nombre_proyecto varchar(255), origen varchar(255), tipo varchar(255), primary key (id));

CREATE TABLE evento_tiempo (id bigint, linea_tiempo_id bigint, orden_absoluto bigint, descripcion varchar(2000), fecha_texto varchar(255), nombre varchar(255) not null, primary key (id));

CREATE TABLE hoja (deleted BOOLEAN DEFAULT false, numero_pagina integer not null, cuaderno_id bigint not null, deleted_date timestamp, fecha_modificacion timestamp, id bigint, contenido CLOB, primary key (id));

CREATE TABLE interaccion (deleted BOOLEAN DEFAULT false, deleted_date timestamp, id bigint, contexto varchar(255), descripcion CLOB, nombre varchar(255), nombre_proyecto varchar(255), resultado varchar(255), tipo varchar(255), primary key (id));

CREATE TABLE linea_tiempo (es_raiz boolean, id bigint, universo_id bigint, descripcion varchar(1000), nombre varchar(255) not null, primary key (id));

CREATE TABLE nodo (entidad_id bigint, id bigint, caracteristica_relacional varchar(255), tipo_entidad varchar(255), primary key (id));

CREATE TABLE nota_rapida (deleted BOOLEAN DEFAULT false, linea integer not null, deleted_date timestamp, fecha_creacion timestamp, hoja_id bigint not null, id bigint, categoria varchar(255), contenido CLOB not null, primary key (id));

CREATE TABLE palabra (conlang_id bigint, id bigint, categoria_gramatical varchar(255), definicion varchar(255), ipa varchar(255), lema varchar(255), notas CLOB, raster_image_path varchar(255), svg_path_data CLOB, primary key (id));

CREATE TABLE relacion (id bigint, nodo_destino_id bigint, nodo_origen_id bigint, descripcion varchar(255), metadata varchar(255), tipo_destino varchar(255), tipo_origen varchar(255), tipo_relacion varchar(255), primary key (id));

CREATE TABLE universo (cuaderno_id bigint not null, id bigint, nombre varchar(255) not null, primary key (id));

CREATE TABLE zona (deleted BOOLEAN DEFAULT false, es_nodo boolean, deleted_date timestamp, id bigint, apellidos varchar(255), desarrollo varchar(255), descripcion CLOB, nombre varchar(255), nombre_proyecto varchar(255), tamanno varchar(255), tipo varchar(255), primary key (id));

