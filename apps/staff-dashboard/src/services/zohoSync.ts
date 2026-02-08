import axios from 'axios';

export interface ZohoTask {
  id: string;
  type: 'payment' | 'form' | 'prechart' | 'chat' | 'fax' | 'note';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  patientId?: string;
  patientName?: string;
  zohoRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

class ZohoSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(tasks: ZohoTask[]) => void> = [];

  startRealTimeSync(intervalMs: number = 30000) {
    // Initial sync
    this.syncTasks();

    // Set up polling
    this.syncInterval = setInterval(() => {
      this.syncTasks();
    }, intervalMs);
  }

  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncTasks(): Promise<ZohoTask[]> {
    try {
      const response = await axios.get('/api/zoho/tasks');
      const tasks = response.data;
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(tasks));
      
      return tasks;
    } catch (error) {
      console.error('Error syncing Zoho tasks:', error);
      throw error;
    }
  }

  async completeTask(taskId: string, notes?: string): Promise<void> {
    try {
      await axios.post(`/api/zoho/tasks/${taskId}/complete`, { notes });
      // Trigger sync after completion
      await this.syncTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: ZohoTask['status']): Promise<void> {
    try {
      await axios.put(`/api/zoho/tasks/${taskId}/status`, { status });
      await this.syncTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  subscribe(listener: (tasks: ZohoTask[]) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export default new ZohoSyncService();
