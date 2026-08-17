import { Router } from 'express';
import { deleteUser, getUsers, updateUserRole, updateUserRoleSchema } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);
router.get('/', getUsers);
router.patch('/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.delete('/:id', deleteUser);

export default router;
