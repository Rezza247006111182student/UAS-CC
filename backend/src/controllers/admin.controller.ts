import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import * as adminService from '../services/admin.service';

export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.listAllOrders({
      status: status as OrderStatus | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.updateOrderStatus(req.params.id, req.body.status as OrderStatus);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.listUsers();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.listAllProducts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.listAllCategories();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.createCategory(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await adminService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
