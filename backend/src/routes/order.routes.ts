import { Router } from 'express';
import { createOrder, list, getOne } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', list);
router.get('/:id', getOne);

export default router;
