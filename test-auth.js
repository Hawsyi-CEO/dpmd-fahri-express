/**
 * Test script to verify Express auth endpoints
 * Usage: node test-auth.js
 */

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3001/api';

async function testAuth() {
  console.log('\n🧪 Testing Express Authentication Flow\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login
    console.log('\n1️⃣  Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@dpmd.bogorkab.go.id',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.data.user.email);
    console.log('   Role:', loginResponse.data.data.user.role);
    
    const token = loginResponse.data.data.token;
    console.log('   Token:', token.substring(0, 50) + '...');
    
    // Step 2: Test Bumdes endpoint with token
    console.log('\n2️⃣  Testing GET /bumdes with token...');
    try {
      const bumdesResponse = await axios.get(`${BASE_URL}/bumdes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Bumdes request successful!');
      console.log('   Records:', bumdesResponse.data.data?.length || 0);
      
    } catch (bumdesError) {
      console.log('❌ Bumdes request failed!');
      console.log('   Status:', bumdesError.response?.status);
      console.log('   Message:', bumdesError.response?.data?.message);
      console.log('   Debug:', JSON.stringify(bumdesError.response?.data?.debug, null, 2));
    }
    
    // Step 3: Test statistics endpoint
    console.log('\n3️⃣  Testing GET /bumdes/statistics with token...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/bumdes/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Statistics request successful!');
      console.log('   Data:', JSON.stringify(statsResponse.data, null, 2));
      
    } catch (statsError) {
      console.log('❌ Statistics request failed!');
      console.log('   Status:', statsError.response?.status);
      console.log('   Message:', statsError.response?.data?.message);
    }
    
  } catch (loginError) {
    console.log('❌ Login failed!');
    console.log('   Error:', loginError.message);
    if (loginError.response) {
      console.log('   Status:', loginError.response.status);
      console.log('   Data:', loginError.response.data);
    } else {
      console.log('   Server might not be running on', BASE_URL);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

testAuth();
