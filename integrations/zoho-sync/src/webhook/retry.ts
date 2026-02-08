import { RetryConfig } from './types';

/**
 * Retry utility with exponential backoff
 */
export class RetryHandler {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: config?.maxRetries ?? 3,
      initialDelayMs: config?.initialDelayMs ?? 1000,
      maxDelayMs: config?.maxDelayMs ?? 30000,
      backoffMultiplier: config?.backoffMultiplier ?? 2,
    };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.config.initialDelayMs;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries) {
          if (onRetry) {
            onRetry(attempt + 1, lastError);
          }

          // Wait before retrying with exponential backoff
          await this.delay(Math.min(delay, this.config.maxDelayMs));
          delay *= this.config.backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Check if an error is retryable
   */
  isRetryableError(error: Error): boolean {
    // Network errors, timeouts, and 5xx errors are retryable
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /ENOTFOUND/i,
      /5\d{2}/, // 5xx HTTP errors
    ];

    return retryablePatterns.some((pattern) => pattern.test(error.message));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
