import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, sort, page, limit } = req.query;
    const result = await productService.listProducts({
      category: category as string | undefined,
      search: search as string | undefined,
      sort: sort as string | undefined,
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

export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await productService.getProduct(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
