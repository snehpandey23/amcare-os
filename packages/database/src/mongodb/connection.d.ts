import mongoose from 'mongoose';
/**
 * MongoDB Connection Manager
 */
declare class MongoDBConnection {
    private connectionString;
    private isConnected;
    constructor();
    /**
     * Connect to MongoDB
     */
    connect(): Promise<void>;
    /**
     * Disconnect from MongoDB
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected
     */
    get connected(): boolean;
    /**
     * Get connection state
     */
    get connectionState(): number;
}
declare const mongoConnection: MongoDBConnection;
export default mongoConnection;
export { mongoose };
//# sourceMappingURL=connection.d.ts.map