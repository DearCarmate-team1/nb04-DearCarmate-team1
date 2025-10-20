import type { Request, Response } from 'express';
import { NotFoundError } from '../configs/custom-error.js';

export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError(`경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`);

  res.status(error.statusCode).json({
    message: error.message,
    path: req.originalUrl,
    method: req.method,
  });
}
