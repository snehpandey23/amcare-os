import express from 'express';
import dotenv from 'dotenv';
import { SpruceWebhookHandler } from './webhooks/webhookHandler';
import { RedisQueueManager } from './queue/redisQueue';
import { EventProcessors } from './processors/eventProcessors';
import { SpruceHealthClient } from './client/spruceClient';

dotenv.config();

/**
 * Spruce Health Integration Service
 */
export class SpruceHealthService {
  private app: express.Application;
  private webhookHandler: SpruceWebhookHandler;
  private queueManager: RedisQueueManager;
  private eventProcessors: EventProcessors;
  private client: SpruceHealthClient;

  constructor() {
    this.app = express();
    this.queueManager = new RedisQueueManager();
    this.webhookHandler = new SpruceWebhookHandler(this.queueManager);
    this.eventProcessors = new EventProcessors();
    this.client = new SpruceHealthClient();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupQueueProcessors();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Webhook routes
    this.app.use('/webhooks', this.webhookHandler.getRouter());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'spruce-health-integration',
        redis: this.queueManager.redis.status,
      });
    });
  }

  /**
   * Setup queue processors
   */
  private setupQueueProcessors(): void {
    // Process appointment.created events
    this.queueManager.processQueue('spruce-webhooks', async (job) => {
      const jobData = job.data as { type: string; payload: any };
      if (jobData.type === 'appointment.created') {
        return await this.eventProcessors.processAppointmentCreated(job as any);
      } else if (jobData.type === 'payment.failed') {
        return await this.eventProcessors.processPaymentFailed(job as any);
      }
      throw new Error(`Unknown job type: ${jobData.type}`);
    });

    // Subscribe to Redis pub/sub events
    this.queueManager.subscribeToEvents(
      ['appointment.created', 'payment.failed'],
      (event) => {
        console.log(`Event received: ${event.eventType}`);
        // Handle real-time events if needed
      }
    );
  }

  /**
   * Start the service
   */
  async start(port: number = 3006): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`🚀 Spruce Health Integration Service running on port ${port}`);
        resolve();
      });
    });
  }

  /**
   * Get API client
   */
  getClient(): SpruceHealthClient {
    return this.client;
  }

  /**
   * Get queue manager
   */
  getQueueManager(): RedisQueueManager {
    return this.queueManager;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Spruce Health service...');
    await this.queueManager.close();
    console.log('Service shut down');
  }
}

// Export singleton instance
export const spruceHealthService = new SpruceHealthService();

// Export client for direct use
export { SpruceHealthClient } from './client/spruceClient';
export { RedisQueueManager } from './queue/redisQueue';
export * from './types';

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  const port = parseInt(process.env.SPRUCE_HEALTH_PORT || '3006');
  spruceHealthService.start(port).catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await spruceHealthService.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await spruceHealthService.shutdown();
    process.exit(0);
  });
}

export default spruceHealthService;
