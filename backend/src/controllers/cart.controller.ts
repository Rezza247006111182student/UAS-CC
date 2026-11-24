import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await cartService.getCart(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const data = await cartService.addItem(req.user!.id, productId, Number(quantity));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity } = req.body;
    const data = await cartService.updateItem(req.user!.id, req.params.id, Number(quantity));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await cartService.removeItem(req.user!.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
