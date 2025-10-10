import { ZodObject } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // 이전 코드: schema.parse({ body: req.body, ... }) -> req.body를 객체로 감싸서 검증했기 때문에 오류 발생
      // 수정 후: req.body를 직접 검증하도록 변경
      schema.parse(req.body);
      next();
    } catch (e: any) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: e.errors,
      });
    }
  };
