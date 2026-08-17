import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMemoryServer = false;

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood_donation_db';

  try {
    // Attempt connecting to configured Mongo URI with 2.5s timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${mongoUri}`);
  } catch (err: any) {
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
