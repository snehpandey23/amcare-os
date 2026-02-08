import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface WellSyncConfig {
  apiKey: string;
  apiUrl: string;
}

class WellSyncAPI {
  private config: WellSyncConfig;
  private client: any;

  constructor() {
    this.config = {
      apiKey: process.env.WELLSYNC_API_KEY || '',
      apiUrl: process.env.WELLSYNC_API_URL || 'https://api.wellsync.com',
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async getPatientData(patientId: string) {
    try {
      const response = await this.client.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient data:', error);
      throw error;
    }
  }

  async syncPatientData(patientId: string) {
    try {
      const data = await this.getPatientData(patientId);
      // Sync to local database
      console.log('Syncing patient data from WellSync...');
      return data;
    } catch (error) {
      console.error('Error syncing patient data:', error);
      throw error;
    }
  }
}

export default WellSyncAPI;
