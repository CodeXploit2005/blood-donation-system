import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  eventSchema,
} from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authMiddleware, adminMiddleware, validate(eventSchema), createEvent);
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

export default router;
