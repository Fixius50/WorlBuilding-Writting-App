-- V2__Add_Raw_Editor_Data_Column.sql
-- Adds raw_editor_data column to palabra table for canvas state persistence

ALTER TABLE palabra ADD COLUMN raw_editor_data TEXT;
