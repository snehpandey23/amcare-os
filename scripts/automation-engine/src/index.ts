import cron from 'node-cron';
import dotenv from 'dotenv';
import DailyAutomationTasks from './tasks';

dotenv.config();

/**
 * Automation Engine Scheduler
 * Runs 8 daily tasks via BullMQ
 */
class AutomationEngine {
  private tasks: DailyAutomationTasks;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.tasks = new DailyAutomationTasks();
  }

  /**
   * Start automation engine
   */
  start(): void {
    // Run at 9:00 AM IST (6:30 PM EST previous day)
    const cronExpression = process.env.AUTOMATION_CRON || '0 9 * * *'; // 9 AM daily

    console.log(`🤖 Starting automation engine with cron: ${cronExpression}`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('\n=== Running Daily Automation Tasks ===');
      console.log(`Scheduled run at: ${new Date().toISOString()}`);

      try {
        await this.tasks.runAllTasks();
      } catch (error) {
        console.error('Error in automation tasks:', error);
      }

      console.log('=== Automation Tasks Completed ===\n');
    });

    // Run immediately on start if configured
    if (process.env.RUN_ON_START === 'true') {
      console.log('Running initial automation tasks on startup...');
      this.tasks.runAllTasks().catch(console.error);
    }

    console.log('✅ Automation engine started');
  }

  /**
   * Stop automation engine
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('🛑 Automation engine stopped');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  const engine = new AutomationEngine();
  engine.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down automation engine...');
    engine.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down automation engine...');
    engine.stop();
    process.exit(0);
  });
}

export default AutomationEngine;
