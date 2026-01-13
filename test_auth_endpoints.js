/**
 * Authentication API Endpoint Tester
 * Run this to verify all auth endpoints are working correctly
 * 
 * Usage: node test_auth_endpoints.js
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost';
const PORT = process.env.PORT || 5000;
const API_BASE = `${BASE_URL}:${PORT}/api/auth`;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testEndpoint(name, method, path, data = null, headers = {}, expectedStatus = 200) {
    try {
        log(`\n${colors.bold}Testing: ${name}${colors.reset}`, 'blue');
        log(`${method} ${path}`);
        if (data) log(`Body: ${JSON.stringify(data, null, 2)}`);
        
        const response = await makeRequest(method, path, data, headers);
        
        const passed = response.statusCode === expectedStatus;
        if (passed) {
            log(`✓ PASSED - Status: ${response.statusCode}`, 'green');
            log(`Response: ${JSON.stringify(response.body, null, 2)}`);
        } else {
            log(`✗ FAILED - Expected: ${expectedStatus}, Got: ${response.statusCode}`, 'red');
            log(`Response: ${JSON.stringify(response.body, null, 2)}`);
        }
        
        return { passed, response };
    } catch (error) {
        log(`✗ ERROR: ${error.message}`, 'red');
        return { passed: false, error };
    }
}

async function runTests() {
    log('\n' + '='.repeat(60), 'bold');
    log('Authentication API Endpoint Tests', 'bold');
    log('='.repeat(60) + '\n', 'bold');

    const results = [];
    let token = null;
    const testEmail = `test_${Date.now()}@example.com`;

    // Test 1: Register endpoint structure
    log('\n>>> Test Suite 1: Register Endpoint', 'yellow');
    const registerResult = await testEndpoint(
        'Register - Missing fields',
        'POST',
        '/register',
        { email: testEmail },
        {},
        400
    );
    results.push(registerResult);

    // Test 2: Register with valid data
    const registerValidResult = await testEndpoint(
        'Register - Valid data',
        'POST',
        '/register',
        {
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            phone: '1234567890',
            password: 'password123',
            confirmPassword: 'password123'
        },
        {},
        201
    );
    results.push(registerValidResult);
    
    if (registerValidResult.passed && registerValidResult.response.body.token) {
        token = registerValidResult.response.body.token;
        log(`✓ Token received: ${token.substring(0, 20)}...`, 'green');
    }

    // Test 3: Login endpoint structure
    log('\n>>> Test Suite 2: Login Endpoint', 'yellow');
    const loginInvalidResult = await testEndpoint(
        'Login - Invalid credentials',
        'POST',
        '/login',
        {
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
        },
        {},
        400
    );
    results.push(loginInvalidResult);

    // Test 4: Login with valid credentials
    const loginValidResult = await testEndpoint(
        'Login - Valid credentials',
        'POST',
        '/login',
        {
            email: testEmail,
            password: 'password123'
        },
        {},
        200
    );
    results.push(loginValidResult);

    if (loginValidResult.passed && loginValidResult.response.body.token) {
        token = loginValidResult.response.body.token;
    }

    // Test 5: Google Sign-In endpoint structure
    log('\n>>> Test Suite 3: Google Sign-In Endpoint', 'yellow');
    const googleNoTokenResult = await testEndpoint(
        'Google Sign-In - No token provided',
        'POST',
        '/google',
        {},
        {},
        400
    );
    results.push(googleNoTokenResult);

    const googleInvalidTokenResult = await testEndpoint(
        'Google Sign-In - Invalid token',
        'POST',
        '/google',
        { idToken: 'invalid_token_here' },
        {},
        400
    );
    results.push(googleInvalidTokenResult);

    // Test 6: Get current user (protected route)
    log('\n>>> Test Suite 4: Protected Routes', 'yellow');
    const meNoTokenResult = await testEndpoint(
        'Get Me - No token',
        'GET',
        '/me',
        null,
        {},
        401
    );
    results.push(meNoTokenResult);

    if (token) {
        const meWithTokenResult = await testEndpoint(
            'Get Me - Valid token',
            'GET',
            '/me',
            null,
            { 'Authorization': `Bearer ${token}` },
            200
        );
        results.push(meWithTokenResult);

        // Test 7: Refresh token
        const refreshTokenResult = await testEndpoint(
            'Refresh Token - Valid token',
            'POST',
            '/refresh-token',
            null,
            { 'Authorization': `Bearer ${token}` },
            200
        );
        results.push(refreshTokenResult);

        // Test 8: Get users (admin check)
        const getUsersResult = await testEndpoint(
            'Get Users - Non-admin user',
            'GET',
            '/users',
            null,
            { 'Authorization': `Bearer ${token}` },
            403
        );
        results.push(getUsersResult);
    }

    // Summary
    log('\n' + '='.repeat(60), 'bold');
    log('Test Summary', 'bold');
    log('='.repeat(60), 'bold');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    log(`\nTotal Tests: ${total}`);
    log(`Passed: ${passed}`, passed === total ? 'green' : 'yellow');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (passed === total) {
        log('✓ All tests passed! Authentication API is working correctly.', 'green');
    } else {
        log('✗ Some tests failed. Please check the errors above.', 'red');
    }

    log('\n' + '='.repeat(60) + '\n', 'bold');
}

// Check if server is running
log('\n' + '='.repeat(60), 'bold');
log('Checking server connection...', 'blue');
log(`Server URL: ${API_BASE}`, 'blue');
log('='.repeat(60) + '\n', 'bold');

makeRequest('GET', '/me', null, {})
    .then(() => {
        log('✓ Server is running and reachable', 'green');
        runTests().catch(error => {
            log(`\n✗ Test execution failed: ${error.message}`, 'red');
            process.exit(1);
        });
    })
    .catch(() => {
        log('✗ Cannot connect to server', 'red');
        log(`Make sure your server is running on ${BASE_URL}:${PORT}`, 'yellow');
        log('Start your server with: npm start', 'yellow');
        process.exit(1);
    });
