"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const registrationRoutes_1 = __importDefault(require("./routes/registrationRoutes"));
const checkinRoutes_1 = __importDefault(require("./routes/checkinRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow local development ports and requests without origin (like Postman / mobile)
        callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Blood Donation System API',
        time: new Date().toISOString(),
    });
});
// API Routes Mounting
app.use('/api/auth', authRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/registrations', registrationRoutes_1.default);
app.use('/api/checkin', checkinRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Catch 404 and Global Error Handlers
app.use(errorMiddleware_1.notFoundMiddleware);
app.use(errorMiddleware_1.errorMiddleware);
exports.default = app;
