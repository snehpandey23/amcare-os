"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// PostgreSQL Connection
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_SIZE || '20'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
exports.pool = new pg_1.Pool(poolConfig);
exports.pool.on('connect', () => {
    console.log('PostgreSQL Database connected');
});
exports.pool.on('error', (err) => {
    console.error('PostgreSQL Database error:', err);
});
// MongoDB Connection and Models
var connection_1 = require("./mongodb/connection");
Object.defineProperty(exports, "mongoConnection", { enumerable: true, get: function () { return __importDefault(connection_1).default; } });
__exportStar(require("./mongodb/models"), exports);
exports.default = exports.pool;
//# sourceMappingURL=index.js.map