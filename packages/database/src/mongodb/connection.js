"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * MongoDB Connection Manager
 */
class MongoDBConnection {
    constructor() {
        this.isConnected = false;
        this.connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
        if (!this.connectionString) {
            throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
        }
    }
    /**
     * Connect to MongoDB
     */
    async connect() {
        if (this.isConnected) {
            console.log('MongoDB already connected');
            return;
        }
        try {
            const options = {
                maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };
            await mongoose_1.default.connect(this.connectionString, options);
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            // Handle connection events
            mongoose_1.default.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true;
            });
        }
        catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }
    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected');
        }
        catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    /**
     * Check if connected
     */
    get connected() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    /**
     * Get connection state
     */
    get connectionState() {
        return mongoose_1.default.connection.readyState;
    }
}
// Singleton instance
const mongoConnection = new MongoDBConnection();
exports.default = mongoConnection;
//# sourceMappingURL=connection.js.map