import type { Request, Response } from 'express';
import authService from '../services/auth-service.js';

const authController = {
  async login(req: Request, res: Response) {
    const loginDto = req.body;
    const result = await authService.login(loginDto);
    res.status(200).json(result);
  },

  async refresh(req: Request, res: Response) {
    const refreshDto = req.body;
    const result = await authService.refresh(refreshDto);
    res.status(200).json(result);
  },
};

export default authController;
