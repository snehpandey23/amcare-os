import cron from 'node-cron';
import dotenv from 'dotenv';
import UnpaidAppointmentCancellationScript from './index';

dotenv.config();

/**
 * Scheduler for running unpaid appointment cancellation script every 30 minutes
 */
class Scheduler {
  private script: UnpaidAppointmentCancellationScript;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.script = new UnpaidAppointmentCancellationScript();
  }

  /**
   * Start the scheduler
   */
  start(): void {
    // Run every 30 minutes: '*/30 * * * *'
    // Format: minute hour day month weekday
    const cronExpression = process.env.CANCELLATION_SCRIPT_CRON || '*/30 * * * *';

    console.log(`Starting scheduler with cron expression: ${cronExpression}`);
    console.log('Script will run every 30 minutes');

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('\n=== Running unpaid appointment cancellation check ===');
      console.log(`Scheduled run at: ${new Date().toISOString()}`);

      try {
        await this.script.execute();
      } catch (error) {
        console.error('Error in scheduled execution:', error);
      }

      console.log('=== Check completed ===\n');
    });

    // Run immediately on start (optional)
    if (process.env.RUN_ON_START === 'true') {
      console.log('Running initial check on startup...');
      this.script.execute().catch(console.error);
    }

    console.log('Scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Scheduler stopped');
    }
  }
}

// Run scheduler if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('scheduler.js') ||
                     process.argv[1]?.endsWith('scheduler.ts');

if (isMainModule) {
  const scheduler = new Scheduler();
  scheduler.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}

export default Scheduler;
