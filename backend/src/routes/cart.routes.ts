import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', removeItem);

export default router;
