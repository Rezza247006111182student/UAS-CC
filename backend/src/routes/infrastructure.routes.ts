import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { getStatus } from '../controllers/infrastructure.controller';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate, roleGuard([UserRole.ADMIN]));

router.get('/status', getStatus);

export default router;
