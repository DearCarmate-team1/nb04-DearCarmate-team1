import { Router } from 'express';
import dashboardController from '../controllers/dashboard-controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// GET /dashboard - 대시보드 통계 조회
router.get(
  '/',
  authenticate, // 인증 미들웨어 적용
  dashboardController.getDashboardData
);

export default router;
