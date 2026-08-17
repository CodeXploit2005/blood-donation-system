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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUsingMemoryDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let isMemoryServer = false;
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood_donation_db';
    try {
        // Attempt connecting to configured Mongo URI with 2.5s timeout
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 2500,
        });
        console.log(`[Database] Connected successfully to MongoDB at ${mongoUri}`);
    }
    catch (err) {
        console.warn(`[Database] Local MongoDB unavailable (${err.message}). Initializing In-Memory MongoDB Server...`);
        try {
            // Lazy load mongodb-memory-server for fast fallback
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            const mongod = await MongoMemoryServer.create();
            const memoryUri = mongod.getUri();
            isMemoryServer = true;
            await mongoose_1.default.connect(memoryUri);
            console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
        }
        catch (memoryErr) {
            console.error(`[Database] Failed to initialize In-Memory MongoDB:`, memoryErr);
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
const isUsingMemoryDB = () => isMemoryServer;
exports.isUsingMemoryDB = isUsingMemoryDB;
exports.default = exports.connectDB;
