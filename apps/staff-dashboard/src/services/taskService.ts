import axios from 'axios';
import { ZohoTask } from './zohoSync';

export interface TaskFilter {
  type?: ZohoTask['type'];
  status?: ZohoTask['status'];
  priority?: ZohoTask['priority'];
  date?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  byType: Record<string, number>;
}

class TaskService {
  async getTasks(filter?: TaskFilter): Promise<ZohoTask[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.type) params.append('type', filter.type);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.priority) params.append('priority', filter.priority);
      if (filter?.date) params.append('date', filter.date);

      const response = await axios.get(`/api/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      const response = await axios.get('/api/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }

  async completeTask(taskId: string, notes?: string): Promise<void> {
    try {
      await axios.post(`/api/tasks/${taskId}/complete`, { notes });
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: ZohoTask['status']): Promise<void> {
    try {
      await axios.put(`/api/tasks/${taskId}/status`, { status });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async assignTask(taskId: string, userId: string): Promise<void> {
    try {
      await axios.post(`/api/tasks/${taskId}/assign`, { userId });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  async getTaskHistory(taskId: string): Promise<any[]> {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }
  }
}

export default new TaskService();
