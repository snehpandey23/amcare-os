import Redis from 'ioredis';
import { EventEmitter } from 'eventemitter3';
import Queue from 'bull';
import {
  IntegrationEvent,
  EventType,
  EventHandler,
  EventSubscription,
} from './types';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Master Event Bus
 * Central event routing for all integrations
 */
export class MasterEventBus extends EventEmitter {
  private redis: Redis;
  private publisher: Redis;
  private subscriber: Redis;
  private queues: Map<string, Queue> = new Map();
  private handlers: Map<EventType, EventHandler[]> = new Map();

  constructor() {
    super();

    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
    };

    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisConfig);
    this.publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisConfig);
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisConfig);

    this.setupSubscriptions();
  }

  /**
   * Publish event to event bus
   */
  async publish(event: IntegrationEvent): Promise<void> {
    try {
      // Emit locally
      this.emit(event.eventType, event);
      this.emit('*', event); // Wildcard listener

      // Publish to Redis pub/sub
      const channel = `events:${event.eventType}`;
      await this.publisher.publish(channel, JSON.stringify(event));

      // Add to queue for processing
      const queue = this.getQueue('event-processing');
      await queue.add(event.eventType, event, {
        jobId: `${event.eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      // Log to audit trail
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.API,
        description: `Event published: ${event.eventType}`,
        metadata: {
          eventType: event.eventType,
          source: event.source,
          correlationId: event.correlationId,
        },
        severity: AuditSeverity.LOW,
        success: true,
      });

      console.log(`📢 Event published: ${event.eventType} from ${event.source}`);
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(subscription: EventSubscription): void {
    const { eventType, handler, queue } = subscription;

    if (queue) {
      // Process via queue
      const eventQueue = this.getQueue(queue);
      eventQueue.process(eventType, async (job) => {
        await handler(job.data);
      });
    } else {
      // Direct subscription
      this.on(eventType, handler);
    }

    // Also subscribe to Redis pub/sub
    const channel = `events:${eventType}`;
    this.subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error(`Error subscribing to ${channel}:`, err);
      } else {
        console.log(`✅ Subscribed to ${channel}`);
      }
    });
  }

  /**
   * Register event handler
   */
  registerHandler(handler: EventHandler): void {
    const eventTypes = Array.isArray(handler.eventType) ? handler.eventType : [handler.eventType];

    eventTypes.forEach((eventType) => {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)!.push(handler);

      // Subscribe to event
      this.subscribe({
        eventType,
        handler: async (event) => {
          try {
            await handler.handle(event);
          } catch (error) {
            console.error(`Error in handler for ${eventType}:`, error);
          }
        },
      });
    });
  }

  /**
   * Setup Redis subscriptions
   */
  private setupSubscriptions(): void {
    this.subscriber.on('message', (channel, message) => {
      try {
        const event: IntegrationEvent = JSON.parse(message);
        this.emit(event.eventType, event);
        this.emit('*', event);
      } catch (error) {
        console.error('Error parsing event message:', error);
      }
    });
  }

  /**
   * Get or create queue
   */
  private getQueue(name: string): Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queue = new Queue(name, {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    queue.on('completed', (job) => {
      console.log(`✅ Job completed: ${job.id} in queue ${name}`);
    });

    queue.on('failed', (job, error) => {
      console.error(`❌ Job failed: ${job?.id} in queue ${name}:`, error);
    });

    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.publisher.quit();
    await this.subscriber.quit();
    await this.redis.quit();
  }
}

// Singleton instance
export const eventBus = new MasterEventBus();

export default eventBus;
