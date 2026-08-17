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
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.post('/', authMiddleware, validate(createRegistrationSchema), createRegistration);
router.get('/my', authMiddleware, getMyRegistrations);
router.get('/event/:eventId', authMiddleware, adminMiddleware, getEventRegistrations);
router.get('/:id', authMiddleware, getRegistrationById);
router.put('/:id', authMiddleware, adminMiddleware, updateRegistrationStatus);
router.delete('/:id', authMiddleware, cancelRegistration);

export default router;
