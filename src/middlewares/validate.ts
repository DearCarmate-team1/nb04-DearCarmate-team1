import { ZodObject, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject, part: 'body' | 'query' | 'params') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
<<<<<<< HEAD
      const validatedData = schema.parse(req[part]);
      Object.assign(req[part], validatedData);
=======
      // 이전 코드: schema.parse({ body: req.body, ... }) -> req.body를 객체로 감싸서 검증했기 때문에 오류 발생
      // 수정 후: req.body를 직접 검증하도록 변경
      schema.parse(req.body);
>>>>>>> ccd47ad (feat: 유저 CRUD API 유효성검사 제외)
      next();
    } catch (e) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: '잘못된 요청입니다.',
        });
      }
>>>>>>> ed7378b (feat: company create 누락된 요소 추가)
=======
>>>>>>> 41c683e (feat: 회사 수정 및 삭제 구현)
      next(e);
    }
  };