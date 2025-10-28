import { Router } from 'express';
import dashboardController from '../controllers/dashboard-controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: 대시보드 통계 조회
 *     description: 이 달의 매출, 진행중/완료된 계약 수, 차종별 통계 등 주요 지표를 조회합니다.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 통계 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 monthlySales:
 *                   type: number
 *                   example: 57000000
 *                 lastMonthSales:
 *                   type: number
 *                   example: 18000000
 *                 growthRate:
 *                   type: number
 *                   example: 216.67
 *                 proceedingContractsCount:
 *                   type: number
 *                   example: 2
 *                 completedContractsCount:
 *                   type: number
 *                   example: 2
 *                 contractsByCarType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       carType:
 *                         type: string
 *                         enum: [SEDAN, SUV, COMPACT, TRUCK, VAN]
 *                       count:
 *                         type: number
 *                 salesByCarType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       carType:
 *                         type: string
 *                         enum: [SEDAN, SUV, COMPACT, TRUCK, VAN]
 *                       count:
 *                         type: number
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증 토큰이 유효하지 않습니다."
 */
router.get(
  '/',
  authenticate,
  dashboardController.getDashboardData
);

export default router;
