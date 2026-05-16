import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);

export default router;
