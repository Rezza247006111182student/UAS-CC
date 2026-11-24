import { Router } from 'express';
import { UserRole } from '@prisma/client';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate, roleGuard([UserRole.ADMIN]));

router.get('/stats', adminController.getStats);
router.get('/orders', adminController.listOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.get('/users', adminController.listUsers);
router.get('/products', adminController.listProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

export default router;
