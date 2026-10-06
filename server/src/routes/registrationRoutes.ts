import { Router } from 'express';
import {
  createRegistration,
  getMyRegistrations,
  getRegistrationById,
  getEventRegistrations,
  updateRegistrationStatus,
  cancelRegistration,
  createRegistrationSchema,
} from '../controllers/registrationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { staffMiddleware, donorMiddleware, cancelPermission, registrationUpdatePermission } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.post('/', authMiddleware, donorMiddleware, validate(createRegistrationSchema), createRegistration);
router.get('/my', authMiddleware, donorMiddleware, getMyRegistrations);
router.get('/event/:eventId', authMiddleware, staffMiddleware, getEventRegistrations);
router.get('/:id', authMiddleware, getRegistrationById);
router.put('/:id', authMiddleware, staffMiddleware, registrationUpdatePermission, updateRegistrationStatus);
router.delete('/:id', authMiddleware, cancelPermission, cancelRegistration);

export default router;
