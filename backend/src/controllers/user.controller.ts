import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await userService.getProfile(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, email } = req.body;
    const data = await userService.updateProfile(req.user!.id, { name, phone, email });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
