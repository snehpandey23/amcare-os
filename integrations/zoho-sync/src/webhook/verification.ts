import crypto from 'crypto';

/**
 * Verify Zoho webhook signature
 */
export class ZohoWebhookVerifier {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string | Buffer,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      // Zoho uses HMAC-SHA256
      const hmac = crypto.createHmac('sha256', this.secret);
      hmac.update(timestamp);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      // Use constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Verify timestamp to prevent replay attacks
   */
  verifyTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
    try {
      const webhookTime = new Date(timestamp).getTime();
      const now = Date.now();
      const age = (now - webhookTime) / 1000;

      return age >= 0 && age <= maxAgeSeconds;
    } catch (error) {
      console.error('Error verifying timestamp:', error);
      return false;
    }
  }
}
