#!/usr/bin/env node
/**
 * Example test script using Playwright MCP
 * Tests the Glyph Editor functionality
 */

import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testGlyphEditor() {
    console.log('🧪 Starting Glyph Editor Test...\n');

    // Initialize MCP client
    const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@playwright/mcp'],
        env: {
            PLAYWRIGHT_HEADLESS: 'false',
            PLAYWRIGHT_BASE_URL: 'http://localhost:5173'
        }
    });

    const client = new MCPClient({
        name: 'glyph-editor-test',
        version: '1.0.0'
    }, {
        capabilities: {}
    });

    await client.connect(transport);

    try {
        // Step 1: Navigate to app
        console.log('📍 Step 1: Navigating to app...');
        await client.callTool({
            name: 'playwright_navigate',
            arguments: { url: 'http://localhost:5173' }
        });

        // Step 2: Select workspace
        console.log('📂 Step 2: Selecting workspace...');
        await client.callTool({
            name: 'playwright_click',
            arguments: { selector: '.workspace-card:first-child' }
        });

        // Step 3: Navigate to Linguistics
        console.log('🔤 Step 3: Opening Linguistics section...');
        await client.callTool({
            name: 'playwright_click',
            arguments: { selector: '[data-nav="linguistics"]' }
        });

        // Step 4: Open glyph editor
        console.log('✏️ Step 4: Opening glyph editor...');
        await client.callTool({
            name: 'playwright_click',
            arguments: { selector: 'button:has-text("New Glyph")' }
        });

        // Step 5: Wait for canvas
        console.log('🎨 Step 5: Waiting for canvas...');
        await client.callTool({
            name: 'playwright_waitForSelector',
            arguments: { selector: 'canvas' }
        });

        // Step 6: Take screenshot
        console.log('📸 Step 6: Taking screenshot...');
        await client.callTool({
            name: 'playwright_screenshot',
            arguments: { path: 'Docs/logs/glyph-editor-test.png' }
        });

        console.log('\n✅ Test completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        throw error;
    } finally {
        await client.close();
    }
}

// Run test
testGlyphEditor().catch(console.error);
