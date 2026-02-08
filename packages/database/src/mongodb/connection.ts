import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Connection Manager
 */
class MongoDBConnection {
  private connectionString: string;
  private isConnected: boolean = false;

  constructor() {
    this.connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
    
    if (!this.connectionString) {
      throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
    }
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB already connected');
      return;
    }

    try {
      const options: mongoose.ConnectOptions = {
        maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(this.connectionString, options);
      
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection state
   */
  get connectionState(): number {
    return mongoose.connection.readyState;
  }
}

// Singleton instance
const mongoConnection = new MongoDBConnection();

export default mongoConnection;

// Export mongoose for direct access if needed
export { mongoose };
