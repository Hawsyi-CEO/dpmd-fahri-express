const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoint...\n');
    
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://127.0.0.1:3001/api/auth/login', {
      email: 'kepaladinas@dpmd.bogorkab.go.id',
      password: 'password'
    });
    
    console.log('Login Status:', loginResponse.status);
    const token = loginResponse.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No token received!');
      process.exit(1);
    }
    
    // Test 2: Dashboard API
    console.log('\n2. Testing dashboard API...');
    const dashboardResponse = await axios.get('http://127.0.0.1:3001/api/kepala-dinas/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Dashboard Status:', dashboardResponse.status);
    console.log('\nDashboard Data:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testAPI();
