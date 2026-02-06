#!/usr/bin/env node
/**
 * Database validation script
 * Validates database schema and migrations using better-sqlite3
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../../../src/main/resources/db/data/worldbuilding.db');

console.log('🗄️ Starting Database Validation...\n');
console.log(`📁 Database: ${DB_PATH}\n`);

if (!existsSync(DB_PATH)) {
    console.error(`❌ Database file not found at: ${DB_PATH}`);
    console.log('\n💡 Make sure the backend has been started at least once to create the database.');
    process.exit(1);
}

try {
    const db = new Database(DB_PATH, { readonly: true });

    // Test 1: Verify raw_editor_data column exists
    console.log('✓ Test 1: Checking palabra table schema...');
    const tableInfo = db.prepare('PRAGMA table_info(palabra)').all();
    const hasRawEditorData = tableInfo.some(col => col.name === 'raw_editor_data');

    if (hasRawEditorData) {
        console.log('  ✅ raw_editor_data column exists');
    } else {
        console.error('  ❌ raw_editor_data column not found!');
        console.log('  💡 Run the migration: V2__Add_Raw_Editor_Data_Column.sql');
    }

    // Test 2: Check migration history
    console.log('\n✓ Test 2: Checking migration history...');
    try {
        const migrations = db.prepare(`
      SELECT version, description, installed_on 
      FROM flyway_schema_history 
      ORDER BY installed_rank DESC 
      LIMIT 5
    `).all();
        console.log(`  ✅ Found ${migrations.length} recent migrations:`);
        migrations.forEach(m => {
            console.log(`     - V${m.version}: ${m.description}`);
        });
    } catch (e) {
        console.log('  ⚠️  Flyway table not found (migrations may not be enabled)');
    }

    // Test 3: Count words in lexicon
    console.log('\n✓ Test 3: Counting lexicon entries...');
    const wordCount = db.prepare('SELECT COUNT(*) as total FROM palabra').get();
    console.log(`  ✅ Total words: ${wordCount.total}`);

    // Test 4: Check words with raw editor data
    console.log('\n✓ Test 4: Checking words with canvas data...');
    const wordsWithData = db.prepare(`
    SELECT COUNT(*) as count 
    FROM palabra 
    WHERE raw_editor_data IS NOT NULL
  `).get();
    console.log(`  ✅ Words with canvas data: ${wordsWithData.count}`);

    // Test 5: List all tables
    console.log('\n✓ Test 5: Listing all tables...');
    const tables = db.prepare(`
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
    console.log(`  ✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`     - ${t.name}`));

    db.close();
    console.log('\n✅ All database validations passed!');
} catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
}
