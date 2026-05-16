import { Router } from 'express';
import { getSystemHealth } from '../controllers/monitoringController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/health', getSystemHealth);

export default router;
