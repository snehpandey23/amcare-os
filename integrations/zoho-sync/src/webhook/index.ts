import express, { Request, Response, NextFunction } from 'express';
import { ZohoWebhookService } from './webhookService';
import { ZohoWebhookPayload } from './types';
import { AuditService } from '@amcare/audit';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize webhook service
const webhookSecret = process.env.ZOHO_WEBHOOK_SECRET || '';
if (!webhookSecret) {
  console.warn('ZOHO_WEBHOOK_SECRET not set - webhook verification will fail');
}

const webhookService = new ZohoWebhookService(webhookSecret);

// Middleware to capture raw body for signature verification
const captureRawBody = (req: Request, res: Response, next: NextFunction) => {
  let data = '';
  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    (req as any).rawBody = Buffer.from(data, 'utf8');
    next();
  });
};

/**
 * Zoho webhook endpoint
 */
router.post(
  '/zoho',
  captureRawBody,
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-zoho-signature'] as string;
      const timestamp = req.headers['x-zoho-timestamp'] as string;

      if (!signature || !timestamp) {
        return res.status(400).json({
          error: 'Missing required headers: x-zoho-signature, x-zoho-timestamp',
        });
      }

      const payload = req.body as ZohoWebhookPayload;
      const rawBody = (req as any).rawBody;

      // Process webhook
      const result = await webhookService.processWebhook(
        payload,
        signature,
        timestamp,
        rawBody
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Webhook processed successfully',
          taskId: result.taskId,
        });
      } else {
        // Return 202 Accepted for retryable errors, 500 for non-retryable
        const statusCode = result.retryable ? 202 : 500;
        res.status(statusCode).json({
          success: false,
          error: result.error,
          retryable: result.retryable,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await AuditService.log({
        action: 'webhook_processing_error',
        resourceType: 'webhook',
        metadata: {
          error: errorMessage,
          body: req.body,
        },
      });

      console.error('Webhook processing error:', error);

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);

/**
 * Retry failed webhook endpoint
 */
router.post('/zoho/retry/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const result = await webhookService.retryWebhook(webhookId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Webhook retried successfully',
        taskId: result.taskId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * Get webhook status
 */
router.get('/zoho/status/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const { pool } = await import('@amcare/database');

    const result = await pool.query(
      `SELECT * FROM webhook_logs WHERE webhook_id = $1`,
      [webhookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
export { ZohoWebhookService };
