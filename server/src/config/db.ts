import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let isMemoryServer = false;

export const connectDB = async (): Promise<void> => {
  if (process.env.LOCAL_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(__dirname, '../../.data/mongodb');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
    await mongoose.connect(mongod.getUri('blood_donation_db'));
    console.log('[Database] Using persistent local development database in server/.data/mongodb');
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood_donation_db';

  try {
    // Attempt connecting to configured Mongo URI with 2.5s timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[Database] Connected successfully to configured MongoDB');
  } catch (err: any) {
    if (process.env.ALLOW_MEMORY_DB !== 'true') throw new Error('Không kết nối được MongoDB đã cấu hình. Kiểm tra MONGO_URI, mạng và Atlas IP Access List; hoặc dùng npm run dev:local để chạy cơ sở dữ liệu phát triển riêng trên máy.');
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Initializing In-Memory MongoDB Server...`);
    try {
      // Lazy load mongodb-memory-server for fast fallback
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      isMemoryServer = true;
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
    } catch (memoryErr: any) {
      console.error(`[Database] Failed to initialize In-Memory MongoDB:`, memoryErr);
      process.exit(1);
    }
  }
};

export const isUsingMemoryDB = () => isMemoryServer;

export default connectDB;
