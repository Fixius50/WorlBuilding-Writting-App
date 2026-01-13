-- SQLite Migration: Add missing 'favorite' column to entidad_generica table
-- This runs on application startup

-- Check if the column exists and add it if not
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we handle errors gracefully
-- The @Transactional in Spring will catch the error if column already exists

-- For databases that don't have the favorite column yet
ALTER TABLE entidad_generica ADD COLUMN favorite BOOLEAN DEFAULT 0;
