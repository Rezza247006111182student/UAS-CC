import { Router } from 'express';
import { list, getOne } from '../controllers/product.controller';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);

export default router;
