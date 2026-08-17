import { Router } from 'express';
import {
  verifyAndCheckIn,
  getEventCheckinList,
  undoCheckIn,
  checkInSchema,
} from '../controllers/checkinController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, validate(checkInSchema), verifyAndCheckIn);
router.get('/event/:eventId', authMiddleware, adminMiddleware, getEventCheckinList);
router.post('/undo/:registrationId', authMiddleware, adminMiddleware, undoCheckIn);

export default router;
