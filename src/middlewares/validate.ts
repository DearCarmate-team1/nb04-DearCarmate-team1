import { ZodObject, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject, part: 'body' | 'query' | 'params') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[part]);
      req[part] = validatedData;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: '잘못된 요청입니다.',
        });
      }
      next(e);
    }
  };
