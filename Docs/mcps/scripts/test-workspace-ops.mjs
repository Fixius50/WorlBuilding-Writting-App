#!/usr/bin/env node
/**
 * Test script for Workspace operations
 * Tests workspace listing, creation, and selection
 */

async function testWorkspaceOperations() {
    console.log('📂 Testing Workspace Operations...\n');

    const BASE_URL = 'http://localhost:8080';
    const TEST_WORKSPACE = {
        name: 'test-workspace-' + Date.now(),
        title: 'Test Workspace',
        genre: 'Testing',
        imageUrl: 'https://via.placeholder.com/150'
    };

    try {
        // Test 1: List existing workspaces
        console.log('✓ Test 1: Listing workspaces...');
        const listResponse = await fetch(`${BASE_URL}/api/workspaces`);

        if (!listResponse.ok) {
            throw new Error(`Failed to list workspaces: ${listResponse.status}`);
        }

        const workspaces = await listResponse.json();
        console.log(`  ✅ Found ${workspaces.length} workspace(s)`);
        workspaces.forEach(w => {
            console.log(`     - ${w.title} (${w.name})`);
        });

        // Test 2: Create new workspace
        console.log('\n✓ Test 2: Creating new workspace...');
        const createResponse = await fetch(`${BASE_URL}/api/workspaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_WORKSPACE)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create workspace: ${createResponse.status} - ${errorText}`);
        }

        const createdWorkspace = await createResponse.json();
        console.log(`  ✅ Created workspace: "${createdWorkspace.title}"`);

        // Test 3: Verify workspace appears in list
        console.log('\n✓ Test 3: Verifying workspace in list...');
        const verifyListResponse = await fetch(`${BASE_URL}/api/workspaces`);
        const updatedWorkspaces = await verifyListResponse.json();

        const foundWorkspace = updatedWorkspaces.find(w => w.name === TEST_WORKSPACE.name);

        if (!foundWorkspace) {
            throw new Error('Created workspace not found in list!');
        }

        console.log(`  ✅ Workspace found in list`);

        // Test 4: Select workspace
        console.log('\n✓ Test 4: Selecting workspace...');
        const selectResponse = await fetch(`${BASE_URL}/api/workspaces/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName: TEST_WORKSPACE.name })
        });

        if (!selectResponse.ok) {
            throw new Error(`Failed to select workspace: ${selectResponse.status}`);
        }

        console.log(`  ✅ Workspace selected successfully`);

        // Test 5: Delete workspace
        console.log('\n✓ Test 5: Deleting test workspace...');
        const deleteResponse = await fetch(`${BASE_URL}/api/workspaces/${TEST_WORKSPACE.name}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            throw new Error(`Failed to delete workspace: ${deleteResponse.status}`);
        }

        console.log(`  ✅ Workspace deleted successfully`);

        console.log('\n✅ All workspace tests passed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n💡 Make sure the backend is running on port 8080');
        process.exit(1);
    }
}

// Run test
testWorkspaceOperations();
