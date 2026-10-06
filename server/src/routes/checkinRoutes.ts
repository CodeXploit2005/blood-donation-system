import { Router } from 'express';
import {
  verifyAndCheckIn,
  getEventCheckinList,
  undoCheckIn,
  checkInSchema,
} from '../controllers/checkinController';
import { authMiddleware } from '../middleware/authMiddleware';
import { staffMiddleware, checkinPermission } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.post('/', authMiddleware, staffMiddleware, checkinPermission, validate(checkInSchema), verifyAndCheckIn);
router.get('/event/:eventId', authMiddleware, staffMiddleware, getEventCheckinList);
router.post('/undo/:registrationId', authMiddleware, staffMiddleware, undoCheckIn);

export default router;
