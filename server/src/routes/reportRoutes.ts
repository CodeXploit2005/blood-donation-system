import { Router } from 'express';
import {
  getDashboardReport,
  getEventReport,
  getEventFunnel,
  exportEventReportCSV,
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardReport);
router.get('/event/:eventId', authMiddleware, adminMiddleware, getEventReport);
router.get('/event/:eventId/funnel', authMiddleware, adminMiddleware, getEventFunnel);
router.get('/event/:eventId/export', authMiddleware, adminMiddleware, exportEventReportCSV);

export default router;
