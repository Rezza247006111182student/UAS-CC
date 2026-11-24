import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

export const list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await categoryService.listCategories();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
