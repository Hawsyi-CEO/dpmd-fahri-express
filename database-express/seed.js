// Database Seeder Runner for Express
// Run all seeders in order

const fs = require('fs');
const path = require('path');

async function runSeeders() {
  try {
    console.log('🌱 Running seeders...\n');

    const seedersDir = path.join(__dirname, 'seeders');
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of files) {
      console.log(`📄 Running seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));
      await seeder();
      console.log('');
    }

    console.log('🎉 All seeders completed!');
  } catch (error) {
    console.error('❌ Seeder error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
