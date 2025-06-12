import { createApp } from '../src/server.js'
import http from 'http'
import { createUser, authenticateUser, generateTokens, verifyToken } from '../src/auth.js'

const PORT = 5001 // Different port for testing
let server

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const req = http.request(reqOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null
          resolve({ status: res.statusCode, data: parsed, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers })
        }
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function testAuthSystem() {
  console.log('🔐 Testing Enhanced Authentication System...\n')

  try {
    // Start test server
    const app = createApp()
    server = app.listen(PORT)
    console.log(`Test server running on port ${PORT}`)

    // Test 1: User Registration
    console.log('📝 Test 1: User Registration')
    const registerResponse = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123'
      }
    })
    
    console.log(`Status: ${registerResponse.status}`)
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful')
      console.log(`User: ${registerResponse.data.user.username}`)
      console.log(`Access Token: ${registerResponse.data.accessToken ? 'Present' : 'Missing'}`)
    } else {
      console.log('❌ Registration failed')
      console.log(registerResponse.data)
    }
    console.log()

    // Test 2: Duplicate Registration
    console.log('📝 Test 2: Duplicate Registration (Should Fail)')
    const duplicateResponse = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'testpass123'
      }
    })
    
    console.log(`Status: ${duplicateResponse.status}`)
    if (duplicateResponse.status === 400) {
      console.log('✅ Duplicate registration properly rejected')
    } else {
      console.log('❌ Duplicate registration should have failed')
    }
    console.log()

    // Test 3: User Login
    console.log('📝 Test 3: User Login')
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        username: 'testuser',
        password: 'testpass123'
      }
    })
    
    let accessToken = null
    let refreshToken = null
    
    console.log(`Status: ${loginResponse.status}`)
    if (loginResponse.status === 200) {
      console.log('✅ Login successful')
      accessToken = loginResponse.data.accessToken
      refreshToken = loginResponse.data.refreshToken
      console.log(`Access Token: ${accessToken ? 'Present' : 'Missing'}`)
      console.log(`Refresh Token: ${refreshToken ? 'Present' : 'Missing'}`)
    } else {
      console.log('❌ Login failed')
      console.log(loginResponse.data)
    }
    console.log()

    // Test 4: Invalid Login
    console.log('📝 Test 4: Invalid Login')
    const invalidLoginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        username: 'testuser',
        password: 'wrongpassword'
      }
    })
    
    console.log(`Status: ${invalidLoginResponse.status}`)
    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid login properly rejected')
    } else {
      console.log('❌ Invalid login should have failed')
    }
    console.log()

    // Test 5: Protected Route Access
    console.log('📝 Test 5: Protected Route Access')
    const protectedResponse = await makeRequest('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    console.log(`Status: ${protectedResponse.status}`)
    if (protectedResponse.status === 200) {
      console.log('✅ Protected route access successful')
      console.log(`User data: ${JSON.stringify(protectedResponse.data.user)}`)
    } else {
      console.log('❌ Protected route access failed')
      console.log(protectedResponse.data)
    }
    console.log()

    // Test 6: Token Refresh
    console.log('📝 Test 6: Token Refresh')
    const refreshResponse = await makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken: refreshToken
      }
    })
    
    console.log(`Status: ${refreshResponse.status}`)
    if (refreshResponse.status === 200) {
      console.log('✅ Token refresh successful')
      console.log(`New Access Token: ${refreshResponse.data.accessToken ? 'Present' : 'Missing'}`)
    } else {
      console.log('❌ Token refresh failed')
      console.log(refreshResponse.data)
    }
    console.log()

    // Test 7: Document Creation with Authentication
    console.log('📝 Test 7: Document Creation with Authentication')
    const documentResponse = await makeRequest('/api/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: {
        title: 'Test Note',
        content: 'This is a test note created with authentication',
        tags: ['test', 'auth']
      }
    })
    
    console.log(`Status: ${documentResponse.status}`)
    if (documentResponse.status === 201) {
      console.log('✅ Authenticated document creation successful')
      console.log(`Document ID: ${documentResponse.data.id}`)
      console.log(`Tags: ${JSON.stringify(documentResponse.data.tags)}`)
    } else {
      console.log('❌ Authenticated document creation failed')
      console.log(documentResponse.data)
    }
    console.log()

    // Test 8: Search and Filter
    console.log('📝 Test 8: Search and Filter')
    const searchResponse = await makeRequest('/api/documents?search=test&tag=auth')
    
    console.log(`Status: ${searchResponse.status}`)
    if (searchResponse.status === 200) {
      console.log('✅ Search and filter successful')
      console.log(`Found ${searchResponse.data.documents.length} documents`)
    } else {
      console.log('❌ Search and filter failed')
    }
    console.log()

    // Test 9: Logout
    console.log('📝 Test 9: Logout')
    const logoutResponse = await makeRequest('/api/auth/logout', {
      method: 'POST',
      body: {
        refreshToken: refreshToken
      }
    })
    
    console.log(`Status: ${logoutResponse.status}`)
    if (logoutResponse.status === 200) {
      console.log('✅ Logout successful')
    } else {
      console.log('❌ Logout failed')
    }
    console.log()

    // Test 10: Health Check
    console.log('📝 Test 10: Health Check')
    const healthResponse = await makeRequest('/api/health')
    
    console.log(`Status: ${healthResponse.status}`)
    if (healthResponse.status === 200) {
      console.log('✅ Health check successful')
      console.log(`Status: ${healthResponse.data.status}`)
    } else {
      console.log('❌ Health check failed')
    }
    console.log()

    console.log('🎉 All authentication tests completed!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.error(error.stack)
  } finally {
    if (server) {
      server.close()
      console.log('Test server closed')
    }
  }
}

// JWT Unit Tests
function testJWTFunctions() {
  console.log('\n🔑 Testing JWT Functions...\n')

  try {
    // Test user creation
    console.log('📝 Test: User Creation')
    const testUser = createUser('jwttest', 'password123', 'jwt@test.com')
    console.log('✅ User created:', testUser.username)

    // Test authentication
    console.log('📝 Test: User Authentication')
    const authenticatedUser = authenticateUser('jwttest', 'password123')
    console.log('✅ User authenticated:', authenticatedUser.username)

    // Test token generation
    console.log('📝 Test: Token Generation')
    const tokens = generateTokens(authenticatedUser)
    console.log('✅ Tokens generated')
    console.log('Access Token Length:', tokens.accessToken.length)
    console.log('Refresh Token Length:', tokens.refreshToken.length)

    // Test token verification
    console.log('📝 Test: Token Verification')
    const decoded = verifyToken(tokens.accessToken)
    console.log('✅ Token verified')
    console.log('Decoded user:', decoded.username)

    console.log('\n🎉 JWT function tests completed!\n')

  } catch (error) {
    console.error('❌ JWT test failed:', error.message)
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Enhanced Smart Notes API Tests\n')
  console.log('=' * 50)
  
  // Run JWT unit tests first
  testJWTFunctions()
  
  // Run integration tests
  await testAuthSystem()
  
  console.log('=' * 50)
  console.log('✨ All tests completed!')
}

runTests().catch(console.error)
