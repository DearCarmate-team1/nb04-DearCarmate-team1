import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library.js';
import { ZodError } from 'zod';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../configs/custom-error.js'; // 앞서 정의하신 AppError 추상 클래스 + 상속 에러들

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error('===== Global Error Handler =====');

  // ✅ Zod 에러
  if (err instanceof ZodError) {
    console.error('Zod validation error:', err.issues);
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    const badRequestError = new BadRequestError('유효성 검증에 실패했습니다.', errorDetails);
    return res.status(badRequestError.statusCode).json({
      message: badRequestError.message,
      details: badRequestError.details,
    });
  }

  // ✅ Prisma 에러
  if (err instanceof PrismaClientValidationError) {
    console.error('Prisma Validation Error:', err.message);
    return res.status(400).json({ message: 'Prisma 쿼리 데이터가 유효하지 않습니다.' });
  }

  if (err instanceof PrismaClientValidationError) {
    console.error('Prisma KnownRequestError:', err.code, err.meta);

    switch (err.code) {
      case 'P2025':
        return res.status(404).json({ message: '요청한 데이터를 찾을 수 없습니다.' });
      case 'P2002': {
        const field = (err.meta?.['target'] as string[])?.[0];
        const modelName = err.meta?.['modelName'] as string;
        const msg = modelName.endsWith('Like')
          ? '이미 좋아요를 눌렀습니다.'
          : `${field} 필드의 값이 이미 존재합니다.`;
        return res.status(409).json({ message: msg });
      }
      case 'P2003':
        return res.status(400).json({ message: '연결된 데이터를 찾을 수 없습니다.' });
    }
  }

  // ✅ 비즈니스 로직 에러 (AppError)
  if (err instanceof AppError) {
    console.error('Business Error:', {
      name: err.name,
      code: err.statusCode,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      headers: req.headers.authorization,
      query: req.query,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? [],
    });
  }

  // ✅ 잡히지 않은 에러 (Catch-all)
  console.error('Unhandled Error:', err.stack || err);
  return res.status(500).json({
    message: '서버 내부에서 에러가 발생했습니다.',
  });
}
