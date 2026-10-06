import dotenv from 'dotenv';
import app from './app';
import connectDB, { isUsingMemoryDB } from './config/db';
import { seedDatabase } from './config/seed';
import { syncAutomaticEventStatuses } from './services/eventStatusService';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured in production');
    }
    // 1. Connect to Database
    await connectDB();

    // 2. Auto-seed initial demo data if needed
    await seedDatabase();

    // Correct existing records immediately, then keep statuses current even
    // when nobody is loading the event list at the transition time.
    await syncAutomaticEventStatuses();
    const eventStatusTimer = setInterval(() => {
      syncAutomaticEventStatuses().catch((error) =>
        console.error('[Event Status] Automatic update failed:', error)
      );
    }, 60_000);
    eventStatusTimer.unref();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Blood Donation Server] Running on http://localhost:${PORT}`);
      console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[API Base] http://localhost:${PORT}/api`);
      console.log('====================================================');
    });
    server.on('error', (error) => {
      console.error(`[Server] Không thể mở cổng ${PORT}: ${error.message}`);
      process.exit(1);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed out remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server] Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
