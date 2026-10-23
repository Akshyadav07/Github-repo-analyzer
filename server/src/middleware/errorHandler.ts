import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Do not leak stack traces in production
  const body: Record<string, unknown> = {
    error: statusCode === 500 ? 'Internal Server Error' : message,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : message,
  };

  if (process.env.NODE_ENV !== 'production') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
