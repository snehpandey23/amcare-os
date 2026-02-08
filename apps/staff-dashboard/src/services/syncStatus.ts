import axios from 'axios';
import { io, Socket } from 'socket.io-client';

export interface SyncStatus {
  spruce: {
    appointments: { paid: number; unpaid: number };
    lastSync: Date;
    status: 'syncing' | 'success' | 'error';
  };
  klarity: {
    faxes: { pending: number; processed: number };
    lastSync: Date;
    status: 'syncing' | 'success' | 'error';
  };
  zoho: {
    patients: number;
    lastSync: Date;
    status: 'syncing' | 'success' | 'error';
  };
  twilio: {
    calls: { inbound: number; outbound: number };
    lastSync: Date;
    status: 'syncing' | 'success' | 'error';
  };
}

class SyncStatusService {
  private socket: Socket | null = null;
  private status: SyncStatus | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      console.log('Connected to sync status server');
    });

    this.socket.on('sync:status', (status: SyncStatus) => {
      this.status = status;
      this.listeners.forEach((listener) => listener(status));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from sync status server');
    });
  }

  async fetchStatus(): Promise<SyncStatus> {
    try {
      const response = await axios.get('/api/sync/status');
      this.status = response.data;
      return this.status;
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }

  async refreshTasks(): Promise<void> {
    try {
      await axios.post('/api/sync/refresh');
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      throw error;
    }
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    if (this.status) {
      listener(this.status);
    }
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SyncStatusService();
