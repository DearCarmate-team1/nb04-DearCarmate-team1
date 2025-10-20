import { Request, Response } from 'express';
import asyncHandler from '../configs/async-handler.js';
import dashboardService from '../services/dashboard-service.js';

const dashboardController = {
  getDashboardData: asyncHandler(async (req: Request, res: Response) => {
    // 'authenticate' 미들웨어가 req.user 객체를 보장합니다.
    const user = req.user;
    const companyId = user.companyId;

    const dashboardData = await dashboardService.getDashboardData(companyId);

    res.status(200).json(dashboardData);
  }),
};

export default dashboardController;
