const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const sharp = require('sharp');
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);

/**
 * Print to thermal printer via Bluetooth serial port
 * POST /api/printer/print
 */
const printToBluetooth = async (req, res) => {
	try {
		const { escposData } = req.body;

		if (!escposData) {
			return res.status(400).json({
				success: false,
				message: 'ESC/POS data is required',
			});
		}

		// Convert ESC/POS string to buffer
		// Use 'latin1' to preserve ESC/POS control characters
		const buffer = Buffer.from(escposData, 'latin1');

		// Write to Bluetooth serial port
		const serialPort = '/dev/rfcomm0';

		try {
			// Check if device exists and is writable
			await fs.promises.access(serialPort, fs.constants.W_OK);

			// Write to serial port
			await appendFile(serialPort, buffer);

			res.json({
				success: true,
				message: 'Print job sent successfully',
			});
		} catch (error) {
			if (error.code === 'ENOENT') {
				return res.status(404).json({
					success: false,
					message: 'Bluetooth printer not found at /dev/rfcomm0. Please check connection.',
				});
			}

			if (error.code === 'EACCES') {
				return res.status(403).json({
					success: false,
					message: 'Permission denied. Run: sudo chmod 666 /dev/rfcomm0',
				});
			}

			throw error;
		}
	} catch (error) {
		console.error('Print error:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Failed to print',
		});
	}
};

/**
 * Check printer status
 * GET /api/printer/status
 */
const getPrinterStatus = async (req, res) => {
	try {
		const serialPort = '/dev/rfcomm0';

		try {
			await fs.promises.access(serialPort, fs.constants.W_OK);
			res.json({
				success: true,
				connected: true,
				port: serialPort,
			});
		} catch (error) {
			res.json({
				success: true,
				connected: false,
				port: serialPort,
				error: error.code === 'ENOENT' ? 'Device not found' : 'Permission denied',
			});
		}
	} catch (error) {
		console.error('Status check error:', error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * Convert image to ESC/POS bitmap format
 * POST /api/printer/convert-image
 */
const convertImageToBitmap = async (req, res) => {
	try {
		const { imagePath, width = 150 } = req.body;

		if (!imagePath) {
			return res.status(400).json({
				success: false,
				message: 'Image path is required',
			});
		}

		// Resolve image path (dari public folder frontend)
		const fullPath = path.join(__dirname, '../../..', 'dpmd-frontend', 'public', imagePath);

		// Check if file exists
		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({
				success: false,
				message: `Image not found: ${imagePath}`,
			});
		}

		// Load and process image with sharp
		const image = sharp(fullPath);
		const metadata = await image.metadata();

		// Calculate height maintaining aspect ratio
		const targetWidth = Math.min(width, 384); // Max width for 58mm thermal
		const targetHeight = Math.round((targetWidth / metadata.width) * metadata.height);

		// Convert to 1-bit monochrome bitmap
		const { data, info } = await image
			.resize(targetWidth, targetHeight, {
				fit: 'inside',
				kernel: 'lanczos3',
			})
			.flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency to white
			.greyscale()
			.normalise()
			.threshold(200) // High threshold: hanya pixel sangat gelap yang jadi hitam
			.raw()
			.toBuffer({ resolveWithObject: true });

		// Convert to ESC/POS bitmap format
		const width8 = Math.ceil(info.width / 8) * 8; // Round to multiple of 8
		const bytesPerLine = width8 / 8;

		// Create bitmap data
		const bitmapData = [];
		for (let y = 0; y < info.height; y++) {
			for (let x = 0; x < bytesPerLine; x++) {
				let byte = 0;
				for (let bit = 0; bit < 8; bit++) {
					const pixelX = x * 8 + bit;
					if (pixelX < info.width) {
						const pixelIndex = y * info.width + pixelX;
						// threshold(200): 0 = dark pixel (print), 255 = light pixel (don't print)
						// ESC/POS: bit 1 = print black, bit 0 = don't print
						if (data[pixelIndex] === 0) { // Only very dark pixels
							byte |= (1 << (7 - bit));
						}
					}
				}
				bitmapData.push(byte);
			}
		}

		// Build ESC/POS command: GS v 0 mode xL xH yL yH [data]
		const ESC = '\x1B';
		const GS = '\x1D';
		
		const xL = bytesPerLine & 0xFF;
		const xH = (bytesPerLine >> 8) & 0xFF;
		const yL = info.height & 0xFF;
		const yH = (info.height >> 8) & 0xFF;

		// Create ESC/POS bitmap command
		let bitmapCommand = GS + 'v0'; // GS v 0 = Print raster bitmap
		bitmapCommand += String.fromCharCode(0); // mode: normal
		bitmapCommand += String.fromCharCode(xL, xH, yL, yH);
		bitmapCommand += Buffer.from(bitmapData).toString('latin1');

		res.json({
			success: true,
			bitmapCommand,
			width: info.width,
			height: info.height,
			bytesPerLine,
			dataSize: bitmapData.length,
		});
	} catch (error) {
		console.error('Image conversion error:', error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

module.exports = {
	printToBluetooth,
	getPrinterStatus,
	convertImageToBitmap,
};
