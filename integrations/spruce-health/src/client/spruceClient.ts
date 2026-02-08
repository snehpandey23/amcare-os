import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  SpruceAppointment,
  SpruceMessage,
  SpruceTask,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  LockNoteRequest,
  LockNoteResponse,
  AppointmentQueryParams,
  MessageQueryParams,
  TaskQueryParams,
} from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Spruce Health API Client
 */
export class SpruceHealthClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.apiKey = process.env.SPRUCE_HEALTH_API_KEY || '';
    this.baseURL = process.env.SPRUCE_HEALTH_API_URL || 'https://api.sprucehealth.com';

    if (!this.apiKey) {
      throw new Error('SPRUCE_HEALTH_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, refresh and retry
          this.accessToken = null;
          const token = await this.getAccessToken();
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/token`, {
        apiKey: this.apiKey,
      });

      this.accessToken = response.data.access_token;
      // Tokens typically expire in 1 hour
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get Spruce Health access token: ${error.message}`);
    }
  }

  /**
   * GET /appointments
   * Filter unpaid appointments with 24hr policy
   */
  async getAppointments(params?: AppointmentQueryParams): Promise<SpruceAppointment[]> {
    try {
      const queryParams: any = {};

      // Default: filter unpaid appointments within 24 hours
      if (params?.paymentStatus === undefined) {
        queryParams.paymentStatus = 'unpaid';
        queryParams.hoursBefore = params?.hoursBefore || 24;
      } else {
        if (params.paymentStatus) queryParams.paymentStatus = params.paymentStatus;
        if (params.hoursBefore) queryParams.hoursBefore = params.hoursBefore;
      }

      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;
      if (params?.status) queryParams.status = params.status;
      if (params?.patientId) queryParams.patientId = params.patientId;

      const response = await this.client.get<{ appointments: SpruceAppointment[] }>('/appointments', {
        params: queryParams,
      });

      return response.data.appointments || [];
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch appointments');
    }
  }

  /**
   * POST /cancel-appointment
   */
  async cancelAppointment(request: CancelAppointmentRequest): Promise<CancelAppointmentResponse> {
    try {
      const response = await this.client.post<CancelAppointmentResponse>('/cancel-appointment', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to cancel appointment');
    }
  }

  /**
   * GET /messages
   * Get messages from past 48 hours
   */
  async getMessages(params?: MessageQueryParams): Promise<SpruceMessage[]> {
    try {
      const queryParams: any = {
        hoursBack: params?.hoursBack || 48,
      };

      if (params?.patientId) queryParams.patientId = params.patientId;
      if (params?.type) queryParams.type = params.type;
      if (params?.direction) queryParams.direction = params.direction;

      const response = await this.client.get<{ messages: SpruceMessage[] }>('/messages', {
        params: queryParams,
      });

      return response.data.messages || [];
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch messages');
    }
  }

  /**
   * POST /lock-note
   */
  async lockNote(request: LockNoteRequest): Promise<LockNoteResponse> {
    try {
      const response = await this.client.post<LockNoteResponse>('/lock-note', request);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to lock note');
    }
  }

  /**
   * GET /tasks
   */
  async getTasks(params?: TaskQueryParams): Promise<SpruceTask[]> {
    try {
      const queryParams: any = {};

      if (params?.status) queryParams.status = params.status;
      if (params?.type) queryParams.type = params.type;
      if (params?.patientId) queryParams.patientId = params.patientId;
      if (params?.assignedTo) queryParams.assignedTo = params.assignedTo;

      const response = await this.client.get<{ tasks: SpruceTask[] }>('/tasks', {
        params: queryParams,
      });

      return response.data.tasks || [];
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch tasks');
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || defaultMessage;
      return new Error(`Spruce Health API Error (${status}): ${message}`);
    } else if (error.request) {
      return new Error(`Spruce Health API Error: No response received - ${defaultMessage}`);
    } else {
      return new Error(`Spruce Health API Error: ${error.message || defaultMessage}`);
    }
  }
}

export default new SpruceHealthClient();
