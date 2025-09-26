// Test Login API with Import format
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const fetch = require('node-fetch')

async function testLogin() {
  try {
    console.log('Testing login API...')
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'hosea',
        password: 'password',
      }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', data)
  } catch (error) {
    console.error('Error testing login:', error.message)
  }
}

testLogin()
