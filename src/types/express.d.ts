import Express from 'express';
import type { Request, Response } from 'express';
import User from './user.ts';

// 기존 Express 네임스페이스 확장 (Request 인터페이스에 user 속성 추가)
declare global {
  namespace Express {
    interface Request {
      user: User & { isAdmin: boolean; companyId: number };
    }
  }
}

// 비동기 요청 핸들러 타입 정의
export type AsyncRequestHandler = (req: Request, res: Response) => Promise<void> | void;
