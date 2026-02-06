#!/usr/bin/env node
/**
 * Test script for Lexicon CRUD operations
 * Tests creating, reading, updating, and deleting words
 */

async function testLexiconCRUD() {
    console.log('📚 Testing Lexicon CRUD Operations...\n');

    const BASE_URL = 'http://localhost:8080';
    const TEST_WORD = {
        lema: 'test-word-' + Date.now(),
        traduccion: 'test translation',
        categoria: 'sustantivo',
        notas: 'Test word created by automated test'
    };

    try {
        // Test 1: Get conlangs list
        console.log('✓ Test 1: Fetching conlangs...');
        const conlangsResponse = await fetch(`${BASE_URL}/api/conlang/lenguas`);

        if (!conlangsResponse.ok) {
            throw new Error(`Failed to fetch conlangs: ${conlangsResponse.status}`);
        }

        const conlangs = await conlangsResponse.json();
        console.log(`  ✅ Found ${conlangs.length} conlang(s)`);

        if (conlangs.length === 0) {
            console.log('  ⚠️  No conlangs found. Create one in the UI first.');
            return;
        }

        const conlangId = conlangs[0].id;
        console.log(`  ℹ️  Using conlang ID: ${conlangId}`);

        // Test 2: Create a new word
        console.log('\n✓ Test 2: Creating new word...');
        const createResponse = await fetch(`${BASE_URL}/api/conlang/${conlangId}/palabra`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_WORD)
        });

        if (!createResponse.ok) {
            throw new Error(`Failed to create word: ${createResponse.status}`);
        }

        const createdWord = await createResponse.json();
        console.log(`  ✅ Created word: "${createdWord.lema}" (ID: ${createdWord.id})`);

        // Test 3: Read the word
        console.log('\n✓ Test 3: Reading word from lexicon...');
        const readResponse = await fetch(`${BASE_URL}/api/conlang/${conlangId}/diccionario`);

        if (!readResponse.ok) {
            throw new Error(`Failed to read lexicon: ${readResponse.status}`);
        }

        const lexicon = await readResponse.json();
        const foundWord = lexicon.find(w => w.id === createdWord.id);

        if (!foundWord) {
            throw new Error('Created word not found in lexicon!');
        }

        console.log(`  ✅ Word found in lexicon: "${foundWord.lema}"`);

        // Test 4: Update the word
        console.log('\n✓ Test 4: Updating word...');
        const updatedData = {
            ...createdWord,
            traduccion: 'updated translation',
            notas: 'Updated by automated test'
        };

        const updateResponse = await fetch(`${BASE_URL}/api/conlang/${conlangId}/palabra/${createdWord.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update word: ${updateResponse.status}`);
        }

        console.log(`  ✅ Word updated successfully`);

        // Test 5: Delete the word
        console.log('\n✓ Test 5: Deleting word...');
        const deleteResponse = await fetch(`${BASE_URL}/api/conlang/${conlangId}/palabra/${createdWord.id}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            throw new Error(`Failed to delete word: ${deleteResponse.status}`);
        }

        console.log(`  ✅ Word deleted successfully`);

        // Test 6: Verify deletion
        console.log('\n✓ Test 6: Verifying deletion...');
        const verifyResponse = await fetch(`${BASE_URL}/api/conlang/${conlangId}/diccionario`);
        const updatedLexicon = await verifyResponse.json();
        const stillExists = updatedLexicon.find(w => w.id === createdWord.id);

        if (stillExists) {
            throw new Error('Word still exists after deletion!');
        }

        console.log(`  ✅ Word successfully removed from lexicon`);

        console.log('\n✅ All lexicon CRUD tests passed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. Backend is running on port 8080');
        console.log('   2. At least one conlang exists in the database');
        process.exit(1);
    }
}

// Run test
testLexiconCRUD();
