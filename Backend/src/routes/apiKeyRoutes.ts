import { Router } from 'express';
import { createApiKey, getApiKeys, revokeApiKey } from '../controllers/apiKeyController';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createApiKeySchema } from '../schemas/apiKey.schema';

const router = Router();

router.use(authenticateJWT); // All API key routes require auth

router.post('/', validate(createApiKeySchema), createApiKey);
router.get('/', getApiKeys);
router.delete('/:id', revokeApiKey);

export default router;
