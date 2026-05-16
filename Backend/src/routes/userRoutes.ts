import { Router } from 'express';
import { getUsers, updateUserTier, toggleUserStatus } from '../controllers/userController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserTierSchema, toggleUserStatusSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticateJWT, requireAdmin); // All user management requires admin

router.get('/', getUsers);
router.put('/:id/tier', validate(updateUserTierSchema), updateUserTier);
router.put('/:id/status', validate(toggleUserStatusSchema), toggleUserStatus);

export default router;
