/**
 * Cron Test Routes
 * For testing push notification manually
 */

const express = require('express');
const router = express.Router();
const cronSchedulerService = require('../services/cronScheduler.service');

// Test morning reminder (today's schedule)
router.get('/test-morning-reminder', async (req, res) => {
	try {
		console.log('\n🧪 Manual test: Morning reminder triggered');
		const result = await cronSchedulerService.testMorningReminder();
		
		res.json({
			success: true,
			message: 'Morning reminder test completed',
			...result
		});
	} catch (error) {
		console.error('Error in test morning reminder:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to test morning reminder',
			error: error.message
		});
	}
});

// Test evening reminder (tomorrow's schedule)
router.get('/test-evening-reminder', async (req, res) => {
	try {
		console.log('\n🧪 Manual test: Evening reminder triggered');
		const result = await cronSchedulerService.testEveningReminder();
		
		res.json({
			success: true,
			message: 'Evening reminder test completed',
			...result
		});
	} catch (error) {
		console.error('Error in test evening reminder:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to test evening reminder',
			error: error.message
		});
	}
});

// Get cron status
router.get('/status', (req, res) => {
	try {
		const status = cronSchedulerService.getStatus();
		res.json({
			success: true,
			status
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to get cron status',
			error: error.message
		});
	}
});

module.exports = router;
