"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const seed_1 = require("./config/seed");
const eventStatusService_1 = require("./services/eventStatusService");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // 1. Connect to Database
        await (0, db_1.default)();
        // 2. Auto-seed initial demo data if needed
        await (0, seed_1.seedDatabase)();
        // Correct existing records immediately, then keep statuses current even
        // when nobody is loading the event list at the transition time.
        await (0, eventStatusService_1.syncAutomaticEventStatuses)();
        const eventStatusTimer = setInterval(() => {
            (0, eventStatusService_1.syncAutomaticEventStatuses)().catch((error) => console.error('[Event Status] Automatic update failed:', error));
        }, 60_000);
        eventStatusTimer.unref();
        // 3. Start Express server
        const server = app_1.default.listen(PORT, () => {
            console.log('====================================================');
            console.log(`[Blood Donation Server] Running on http://localhost:${PORT}`);
            console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
            console.log(`[API Base] http://localhost:${PORT}/api`);
            console.log('====================================================');
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
    }
    catch (error) {
        console.error('[Server] Fatal error starting server:', error);
        process.exit(1);
    }
};
startServer();
