// Test: Can we load controller without server.js?
const dinasConfigController = require('./src/controllers/dinasConfig.controller');

console.log('Controller type:', typeof dinasConfigController);
console.log('Controller keys:', Object.keys(dinasConfigController));
console.log('getConfig type:', typeof dinasConfigController.getConfig);
console.log('upsertConfig type:', typeof dinasConfigController.upsertConfig);
console.log('uploadTTD type:', typeof dinasConfigController.uploadTTD);
console.log('deleteTTD type:', typeof dinasConfigController.deleteTTD);

// Test if methods are callable
try {
  console.log('getConfig.name:', dinasConfigController.getConfig.name);
  console.log('SUCCESS: Controller loaded and methods accessible');
} catch(e) {
  console.error('FAIL:', e.message);
}
