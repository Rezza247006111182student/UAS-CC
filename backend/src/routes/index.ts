import { Router } from 'express';
import authRouter from './auth.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes';
import cartRouter from './cart.routes';
import orderRouter from './order.routes';
import userRouter from './user.routes';
import adminRouter from './admin.routes';
import infrastructureRouter from './infrastructure.routes';

const router = Router();

router.use('/api/auth', authRouter);
router.use('/api/products', productRouter);
router.use('/api/categories', categoryRouter);
router.use('/api/cart', cartRouter);
router.use('/api/orders', orderRouter);
router.use('/api/users', userRouter);
router.use('/api/admin', adminRouter);
router.use('/api/infrastructure', infrastructureRouter);

export default router;
