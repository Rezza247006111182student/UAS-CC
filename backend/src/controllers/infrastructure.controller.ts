import { Request, Response, NextFunction } from 'express';
import * as infrastructureService from '../services/infrastructure.service';

export const getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await infrastructureService.getInfrastructureStatus();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
