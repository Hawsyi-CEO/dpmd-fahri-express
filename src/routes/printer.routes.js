const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { printToBluetooth, getPrinterStatus, convertImageToBitmap } = require('../controllers/printer.controller');

// All routes require authentication
router.use(auth);

// Print to Bluetooth thermal printer
router.post('/print', printToBluetooth);

// Check printer status
router.get('/status', getPrinterStatus);

// Convert image to ESC/POS bitmap
router.post('/convert-image', convertImageToBitmap);

module.exports = router;
