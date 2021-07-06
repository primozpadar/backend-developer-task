import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode?: number, message?: string) {
    super(message || 'unknown error');
    this.statusCode = statusCode || 500;
    this.name = 'ApiError';

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const customErrorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }
  return next(err);
};

export const celebrateErrorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (isCelebrateError(err)) {
    const errors: string[] = [];
    err.details.forEach((x) => errors.push(x.message));

    return res.status(400).json({ status: 'error', message: 'validation error', errors });
  }
  return next(err);
};

export const defaultErrorHandler = (_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({ status: 'error', message: 'unknown error' });
};
