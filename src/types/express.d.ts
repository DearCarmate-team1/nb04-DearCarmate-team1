import Express from 'express';
import User from './user.ts';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
