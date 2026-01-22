-- V2__add_json_to_entidad.sql
-- Add json_attributes column to entidad_generica for flexible schema

ALTER TABLE entidad_generica ADD COLUMN json_attributes TEXT;
