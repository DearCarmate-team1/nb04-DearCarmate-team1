import { ZodObject, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject, part: 'body' | 'query' | 'params') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[part]);
      Object.assign(req[part], validatedData);
      next();
    } catch (e) {
<<<<<<< HEAD
=======
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: '잘못된 요청입니다.',
        });
      }
>>>>>>> ed7378b (feat: company create 누락된 요소 추가)
      next(e);
    }
  };