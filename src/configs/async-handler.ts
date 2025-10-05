import { Request, Response, NextFunction } from 'express';
import { AsyncRequestHandler } from '../types/express.js';

export default function asyncHandler(handler: AsyncRequestHandler) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await handler(req, res);
    } catch (e) {
      next(e);
    }
  };
}
