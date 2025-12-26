const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'disposisi.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to replace complex position includes with simple role-only selects
const complexPattern = /select:\s*\{\s*id:\s*true,\s*name:\s*true,\s*email:\s*true,\s*role:\s*true,\s*position_id:\s*true,\s*position:\s*\{\s*select:\s*\{\s*id:\s*true,\s*code:\s*true,\s*name:\s*true,\s*level:\s*true\s*\}\s*\}\s*\},/g;

const simpleReplacement = `select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true
          },`;

// Count occurrences
const matches = content.match(complexPattern);
console.log(`Found ${matches ? matches.length : 0} matches to replace`);

// Replace all occurrences
content = content.replace(complexPattern, simpleReplacement);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File updated successfully!');
console.log('Removed all position includes from user queries');
