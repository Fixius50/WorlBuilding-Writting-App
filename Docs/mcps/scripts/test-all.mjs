#!/usr/bin/env node
/**
 * Comprehensive test suite for WorldbuildingApp
 * Tests all major API endpoints
 */

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 8080;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : null;
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function runAllTests() {
    console.log('🧪 WorldbuildingApp Test Suite\n');
    console.log('='.repeat(50));

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Health Check
    console.log('\n📍 Test 1: Health Check');
    try {
        const result = await makeRequest('GET', '/api/system/health');
        if (result.status === 200) {
            console.log(`  ✅ PASSED - Server is UP (timestamp: ${result.data.timestamp})`);
            passedTests++;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        failedTests++;
    }

    // Test 2: List Workspaces
    console.log('\n📂 Test 2: List Workspaces');
    try {
        const result = await makeRequest('GET', '/api/workspaces');
        if (result.status === 200) {
            console.log(`  ✅ PASSED - Found ${result.data.length} workspace(s)`);
            result.data.forEach(w => {
                console.log(`     - ${w.title} (${w.name})`);
            });
            passedTests++;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        failedTests++;
    }

    // Test 3: List Conlangs
    console.log('\n🔤 Test 3: List Conlangs');
    try {
        const result = await makeRequest('GET', '/api/conlang/lenguas');
        if (result.status === 200) {
            console.log(`  ✅ PASSED - Found ${result.data.length} conlang(s)`);
            result.data.forEach(c => {
                console.log(`     - ${c.nombre} (ID: ${c.id})`);
            });
            passedTests++;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        failedTests++;
    }

    // Test 4: Get Conlang Stats
    console.log('\n📊 Test 4: Conlang Statistics');
    try {
        const result = await makeRequest('GET', '/api/conlang/stats');
        if (result.status === 200) {
            console.log(`  ✅ PASSED - Stats retrieved successfully`);
            console.log(`     Total words: ${result.data.totalWords || 0}`);
            console.log(`     Total languages: ${result.data.totalLanguages || 0}`);
            passedTests++;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        failedTests++;
    }

    // Test 5: Backend Responsiveness
    console.log('\n⚡ Test 5: Backend Responsiveness');
    try {
        const startTime = Date.now();
        const result = await makeRequest('GET', '/api/system/health');
        const responseTime = Date.now() - startTime;

        if (result.status === 200) {
            console.log(`  ✅ PASSED - Response time: ${responseTime}ms`);
            if (responseTime < 100) {
                console.log(`     🚀 Excellent response time!`);
            } else if (responseTime < 500) {
                console.log(`     ✓ Good response time`);
            } else {
                console.log(`     ⚠️  Slow response time`);
            }
            passedTests++;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        console.log(`  ❌ FAILED - ${error.message}`);
        failedTests++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 Test Summary:');
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📊 Total:  ${passedTests + failedTests}`);

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the output above for details.');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('\n💥 Test suite crashed:', error.message);
    console.log('\n💡 Make sure the backend is running on port 8080');
    process.exit(1);
});
