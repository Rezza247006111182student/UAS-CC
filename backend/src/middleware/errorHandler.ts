import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`, err.stack);

  const body: Record<string, unknown> = {
    success: false,
    message,
  };

  if (err.errors) {
    body.errors = err.errors;
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
