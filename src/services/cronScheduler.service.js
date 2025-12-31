/**
 * Cron Scheduler Service
 * Handles scheduled tasks for the application
 */

const cron = require('node-cron');
const pushNotificationService = require('./pushNotification.service');

class CronSchedulerService {
	constructor() {
		this.jobs = {};
	}

	/**
	 * Initialize all cron jobs
	 */
	init() {
		console.log('🕐 Initializing cron scheduler...');

		// Morning reminder: 7:00 AM (Today's schedule)
		this.jobs.morningReminder = cron.schedule('0 7 * * *', async () => {
			console.log('\n⏰ Running morning schedule reminder (7:00 AM)...');
			try {
				const result = await pushNotificationService.sendTodayScheduleReminder();
				console.log('✅ Morning reminder completed:', result);
			} catch (error) {
				console.error('❌ Morning reminder failed:', error);
			}
		}, {
			scheduled: true,
			timezone: 'Asia/Jakarta'
		});

		// Evening reminder: 9:00 PM (Tomorrow's schedule)
		this.jobs.eveningReminder = cron.schedule('0 21 * * *', async () => {
			console.log('\n⏰ Running evening schedule reminder (9:00 PM)...');
			try {
				const result = await pushNotificationService.sendTomorrowScheduleReminder();
				console.log('✅ Evening reminder completed:', result);
			} catch (error) {
				console.error('❌ Evening reminder failed:', error);
			}
		}, {
			scheduled: true,
			timezone: 'Asia/Jakarta'
		});

		console.log('✅ Cron jobs initialized:');
		console.log('   - Morning reminder (Today\'s schedule): Every day at 07:00 WIB');
		console.log('   - Evening reminder (Tomorrow\'s schedule): Every day at 21:00 WIB');
	}

	/**
	 * Stop all cron jobs
	 */
	stopAll() {
		Object.keys(this.jobs).forEach(jobName => {
			if (this.jobs[jobName]) {
				this.jobs[jobName].stop();
				console.log(`⏸️  Stopped cron job: ${jobName}`);
			}
		});
	}

	/**
	 * Start all cron jobs
	 */
	startAll() {
		Object.keys(this.jobs).forEach(jobName => {
			if (this.jobs[jobName]) {
				this.jobs[jobName].start();
				console.log(`▶️  Started cron job: ${jobName}`);
			}
		});
	}

	/**
	 * Get status of all cron jobs
	 */
	getStatus() {
		const status = {};
		Object.keys(this.jobs).forEach(jobName => {
			status[jobName] = {
				running: this.jobs[jobName] ? true : false
			};
		});
		return status;
	}

	/**
	 * Test notification manually
	 */
	async testMorningReminder() {
		console.log('🧪 Testing morning reminder manually...');
		try {
			const result = await pushNotificationService.sendTodayScheduleReminder();
			console.log('✅ Test completed:', result);
			return result;
		} catch (error) {
			console.error('❌ Test failed:', error);
			throw error;
		}
	}

	/**
	 * Test evening notification manually
	 */
	async testEveningReminder() {
		console.log('🧪 Testing evening reminder manually...');
		try {
			const result = await pushNotificationService.sendTomorrowScheduleReminder();
			console.log('✅ Test completed:', result);
			return result;
		} catch (error) {
			console.error('❌ Test failed:', error);
			throw error;
		}
	}
}

module.exports = new CronSchedulerService();
