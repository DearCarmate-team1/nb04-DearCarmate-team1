import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../configs/prisma-client.js';
import { ACCESS_TOKEN_SECRET } from '../configs/constants.js';
import {
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from '../configs/custom-error.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new UnauthorizedError('Access Token이 필요합니다.'));
  }

  // "Bearer ..." 형식인지 확인
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new BadRequestError('잘못된 Authorization 헤더 형식입니다.'));
  }

  const token = parts[1];

  try {
    if (!token) {
      return next(new NotFoundError('토큰이 존재하지 않습니다.'));
    }
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // verify 결과 타입이 string | JwtPayload 임
    if (typeof decoded === 'string' || !('id' in decoded)) {
      throw new ForbiddenError('유효하지 않은 Access Token입니다.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    req.user = us6er;

    next();
  } catch (err) {
    return next(new ForbiddenError('Access Token 검증 실패'));
  }
}
