import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  apiUrl: string;
}

class ZohoSync {
  private config: ZohoConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
      refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
      apiUrl: 'https://www.zohoapis.com',
    };
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
        },
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Zoho access token:', error);
      throw error;
    }
  }

  async syncContacts() {
    const token = await this.getAccessToken();
    // Implementation for syncing contacts
    console.log('Syncing contacts with Zoho...');
  }

  async syncInvoices() {
    const token = await this.getAccessToken();
    // Implementation for syncing invoices
    console.log('Syncing invoices with Zoho...');
  }

  async sync() {
    try {
      await this.syncContacts();
      await this.syncInvoices();
      console.log('Zoho sync completed successfully');
    } catch (error) {
      console.error('Zoho sync failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const sync = new ZohoSync();
  sync.sync().catch(console.error);
}

export default ZohoSync;
