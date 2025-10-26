import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import authController from '../controllers/auth-controller.js';
import { loginSchema, refreshSchema } from '../dtos/auth-dto.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 이메일과 비밀번호로 로그인하여 Access Token과 Refresh Token을 발급받습니다.
 *     tags: [Auth]
 *     security: [] # 이 API는 인증이 필요 없습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user1@sunshine.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: "잘못된 요청 (예: 이메일 형식 오류)"
 *       401:
 *         description: "인증 실패 (예: 비밀번호 불일치)"
 */
router.post('/login', validate(loginSchema, 'body'), asyncHandler(authController.login));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     description: 유효한 Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.
 *     tags: [Auth]
 *     security: [] # 이 API는 인증이 필요 없습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: 유효하지 않은 Refresh Token
 */
router.post('/refresh', validate(refreshSchema, 'body'), asyncHandler(authController.refresh));

export default router;
