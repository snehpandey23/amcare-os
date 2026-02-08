import Queue, { Job } from 'bull';
import Redis from 'ioredis';
import { EventEmitter } from 'eventemitter3';
import { EventPayload, QueueJobData } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Redis Queue Manager for Event-Driven Architecture
 */
export class RedisQueueManager extends EventEmitter {
  private redis: Redis;
  private queues: Map<string, Queue> = new Map();

  constructor() {
    super();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.emit('error', error);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
      this.emit('connected');
    });
  }

  /**
   * Get or create a queue
   */
  getQueue(name: string): Queue {
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
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Set up queue event handlers
    queue.on('completed', (job) => {
      this.emit('job:completed', { queue: name, jobId: job.id });
    });

    queue.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed in queue ${name}:`, error);
      this.emit('job:failed', { queue: name, jobId: job?.id, error });
    });

    queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled in queue ${name}`);
      this.emit('job:stalled', { queue: name, jobId: job.id });
    });

    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Add job to queue
   */
  async addJob(queueName: string, data: QueueJobData, options?: any): Promise<any> {
    const queue = this.getQueue(queueName);
    return queue.add(data.type, data.payload, {
      ...options,
      jobId: `${data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  /**
   * Process jobs from queue
   */
  processQueue(queueName: string, processor: (job: any) => Promise<any>): void {
    const queue = this.getQueue(queueName);
    queue.process(async (job) => {
      try {
        const result = await processor(job);
        this.emit('job:processed', { queue: queueName, jobId: job.id, result });
        return result;
      } catch (error) {
        this.emit('job:error', { queue: queueName, jobId: job.id, error });
        throw error;
      }
    });
  }

  /**
   * Publish event to Redis pub/sub
   */
  async publishEvent(event: EventPayload): Promise<void> {
    const channel = `spruce:events:${event.eventType}`;
    await this.redis.publish(channel, JSON.stringify(event));
    this.emit('event:published', event);
  }

  /**
   * Subscribe to events
   */
  subscribeToEvents(eventTypes: string[], handler: (event: EventPayload) => void): void {
    const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    eventTypes.forEach((eventType) => {
      const channel = `spruce:events:${eventType}`;
      subscriber.subscribe(channel, (err) => {
        if (err) {
          console.error(`Error subscribing to ${channel}:`, err);
        } else {
          console.log(`Subscribed to ${channel}`);
        }
      });
    });

    subscriber.on('message', (channel, message) => {
      try {
        const event: EventPayload = JSON.parse(message);
        handler(event);
      } catch (error) {
        console.error('Error parsing event message:', error);
      }
    });
  }

  /**
   * Close all queues and connections
   */
  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.redis.quit();
  }
}

export default new RedisQueueManager();
