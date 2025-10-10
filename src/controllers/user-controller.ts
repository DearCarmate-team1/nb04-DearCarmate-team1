import type { Request, Response } from 'express';
import userService from '../services/user-service.js';

const userController = {
  async createUser(req: Request, res: Response) {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  },

  async getMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  },

  async updateMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json(updatedUser);
  },

  async deleteMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    await userService.deleteUser(userId);
    res.status(200).json({ message: '유저 삭제 성공' });
  },

  async getUserById(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  },

  async updateUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json(updatedUser);
  },

  async deleteUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    await userService.deleteUser(userId);
    res.status(204).send();
  },
};

export default userController;
