import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.code === '23505') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
