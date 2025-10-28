import Express from 'express';
import type { Request, Response } from 'express';
import type { Multer } from 'multer';
import type { File as MulterFile } from 'multer';
import type { AuthUser } from './auth-user.js';

declare global {
  namespace Express {
    interface Request {
      /** 인증된 사용자 정보 (authenticate 미들웨어에서 설정) */
      user: AuthUser;
      file?: MulterFile;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export type AsyncRequestHandler = (req: Request, res: Response) => Promise<void> | void;
