import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    const data = await authService.register(email, name, password);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await authService.me(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, message: 'Logged out' });
};
