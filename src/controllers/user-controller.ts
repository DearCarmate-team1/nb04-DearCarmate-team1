import type { Request, Response } from 'express';
import userService from '../services/user-service.js';

const userController = {
  /** 유저 생성 */
  async createUser(req: Request, res: Response) {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  },

  /** 내 정보 조회 */
  async getMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  },

  /** 내 정보 수정 */
  async updateMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json(updatedUser);
  },

  /** 내 정보 삭제 */
  async deleteMe(req: Request, res: Response) {
    // 인증 미들웨어에서 추가해준 user.id를 사용
    const userId = req.user.id;
    await userService.deleteUser(userId);
    res.status(200).json({ message: '유저 삭제 성공' });
  },

  /** 유저 조회 (관리자용) */
  async getUserById(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  },

  /** 유저 수정 (관리자용) */
  async updateUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    res.status(200).json(updatedUser);
  },

  /** 유저 삭제 (관리자용) */
  async deleteUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    await userService.deleteUser(userId);
    res.status(204).send();
  },
};

export default userController;
