// Test: Check how routes load controller
console.log('STEP 1: Load models first');
require('dotenv').config();
const { sequelize } = require('./src/models');

console.log('\nSTEP 2: Load controller');
const controllerModule = require.resolve('./src/controllers/dinasConfig.controller');
console.log('Controller module path:', controllerModule);

const controller1 = require('./src/controllers/dinasConfig.controller');
console.log('First require - type:', typeof controller1);
console.log('First require - getConfig:', typeof controller1.getConfig);

console.log('\nSTEP 3: Load controller AGAIN (from cache)');
const controller2 = require('./src/controllers/dinasConfig.controller');
console.log('Second require - same instance?:', controller1 === controller2);
console.log('Second require - getConfig:', typeof controller2.getConfig);

console.log('\nSTEP 4: Now try loading routes');
try {
  const router = require('./src/routes/dinasConfig.routes');
  console.log('SUCCESS: Routes loaded!', typeof router);
} catch(e) {
  console.error('FAIL loading routes:', e.message);
  console.error('Stack:', e.stack.split('\n').slice(0,5).join('\n'));
}
