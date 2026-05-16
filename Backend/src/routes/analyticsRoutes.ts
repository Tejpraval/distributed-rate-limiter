import { Router } from 'express';
import { getTraffic, getSummary, getTopConsumers } from '../controllers/analyticsController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT); // All analytics require auth

router.get('/traffic', getTraffic);
router.get('/summary', getSummary);
router.get('/top-consumers', requireAdmin, getTopConsumers);

export default router;
