import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, BadRequestError } from '../configs/custom-error.js';
import { NODE_ENV } from '../configs/constants.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR] Global Error Handler');
  console.error('[ERROR] Name:', err.name);
  console.error('[ERROR] Message:', err.message);
  console.error('[ERROR] Request:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  if (NODE_ENV === 'development') {
    console.error('[ERROR] Stack:', err.stack);
  }

  // Zod 유효성 검증 에러
  if (err instanceof ZodError) {
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    const validationError = new BadRequestError('유효성 검증에 실패했습니다.', errorDetails);

    return res.status(validationError.statusCode).json({
      message: validationError.message,
      details: validationError.details,
    });
  }

  // Prisma 에러
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: '데이터베이스 쿼리가 유효하지 않습니다.',
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('[ERROR] Prisma error code:', err.code);
    console.error('[ERROR] Prisma meta:', err.meta);

    switch (err.code) {
      case 'P2002': {
        const field = (err.meta?.['target'] as string[])?.[0] || '데이터';
        return res.status(409).json({
          message: `${field} 값이 이미 존재합니다.`,
        });
      }
      case 'P2025':
        return res.status(404).json({
          message: '요청한 데이터를 찾을 수 없습니다.',
        });
      case 'P2003':
        return res.status(400).json({
          message: '연결된 데이터를 찾을 수 없습니다.',
        });
      default:
        return res.status(500).json({
          message: '데이터베이스 오류가 발생했습니다.',
        });
    }
  }

  // 비즈니스 로직 에러 (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.error('[ERROR] Unhandled error:', err);

  return res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    ...(NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
}
