import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../configs/custom-error.js';

export function isAdmin(req: Request, _res: Response, next: NextFunction) {
  // authenticate 미들웨어에서 req.user를 보장해 주지만, 안전을 위해 추가 확인
  if (!req.user || !req.user.isAdmin) {
    return next(new ForbiddenError('관리자 권한이 필요합니다.'));
  }
  next();
}
