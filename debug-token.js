/**
 * Debug script to decode and inspect JWT token
 * Usage: node debug-token.js <your-token-here>
 */

const jwt = require('jsonwebtoken');

// Get token from command line argument or use a hardcoded one for testing
const token = process.argv[2];

if (!token) {
  console.log('\n❌ No token provided!');
  console.log('\nUsage: node debug-token.js <your-expressToken>');
  console.log('\nTo get your token:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Console tab');
  console.log('3. Type: localStorage.getItem("expressToken")');
  console.log('4. Copy the token (without quotes)');
  console.log('5. Run: node debug-token.js <paste-token-here>\n');
  process.exit(1);
}

console.log('\n🔍 Decoding JWT Token...\n');
console.log('Token length:', token.length);
console.log('Token starts with:', token.substring(0, 30) + '...\n');

try {
  // Decode without verification to see payload
  const decoded = jwt.decode(token);
  
  console.log('✅ Token Payload:');
  console.log('━'.repeat(60));
  console.log('ID:', decoded.id);
  console.log('Name:', decoded.name);
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role, `(type: ${typeof decoded.role})`);
  console.log('Desa ID:', decoded.desa_id);
  console.log('Issued At:', new Date(decoded.iat * 1000).toLocaleString());
  console.log('Expires At:', new Date(decoded.exp * 1000).toLocaleString());
  console.log('━'.repeat(60));
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp < now) {
    console.log('\n⚠️  WARNING: Token is EXPIRED!');
    console.log(`   Expired ${Math.floor((now - decoded.exp) / 60)} minutes ago`);
  } else {
    console.log('\n✅ Token is still valid');
    console.log(`   Expires in ${Math.floor((decoded.exp - now) / 60)} minutes`);
  }
  
  // Role validation check
  console.log('\n🔐 Role Validation:');
  console.log('━'.repeat(60));
  const userRole = String(decoded.role).trim().toLowerCase();
  const allowedRoles = ['desa', 'sarpras', 'admin', 'superadmin'];
  console.log('Normalized role:', `"${userRole}"`);
  console.log('Allowed roles:', allowedRoles);
  console.log('Is authorized:', allowedRoles.includes(userRole) ? '✅ YES' : '❌ NO');
  console.log('━'.repeat(60));
  
  console.log('\n📋 Full Payload (JSON):');
  console.log(JSON.stringify(decoded, null, 2));
  
} catch (error) {
  console.log('❌ Error decoding token:', error.message);
}

console.log('\n');
