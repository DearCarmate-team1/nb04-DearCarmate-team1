import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import userController from '../controllers/user-controller.js';
import { createUserSchema, updateUserSchema } from '../dtos/user-dto.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isAdmin } from '../middlewares/authorize.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id: 
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         employeeNumber:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         companyName:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 신규 사용자 회원가입
 *     description: 새로운 사용자를 시스템에 등록합니다.
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, employeeNumber, phoneNumber, password, passwordConfirmation, companyName, companyCode]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               employeeNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirmation:
 *                 type: string
 *                 format: password
 *               companyName:
 *                 type: string
 *               companyCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: 잘못된 요청 데이터
 */
router.post('/', validate(createUserSchema, 'body'), asyncHandler(userController.createUser));

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 현재 로그인된 사용자의 정보를 조회합니다.
 *     tags: [User (My)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: 인증 실패
 */
router.get('/me', authenticate, asyncHandler(userController.getMe));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: 내 정보 수정
 *     description: 현재 로그인된 사용자의 정보를 수정합니다. 정보 수정을 위해 현재 비밀번호 확인이 필요합니다.
 *     tags: [User (My)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               employeeNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirmation:
 *                 type: string
 *                 format: password
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 내 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: 잘못된 요청 데이터 또는 현재 비밀번호 불일치
 *       401:
 *         description: 인증 실패
 */
router.patch('/me', authenticate, validate(updateUserSchema, 'body'), asyncHandler(userController.updateMe));

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 현재 로그인된 사용자의 계정을 삭제합니다.
 *     tags: [User (My)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *       401:
 *         description: 인증 실패
 */
router.delete('/me', authenticate, asyncHandler(userController.deleteMe));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 특정 사용자 정보 조회 (관리자용)
 *     description: 관리자가 ID로 특정 사용자의 정보를 조회합니다.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/:id', authenticate, isAdmin, asyncHandler(userController.getUserById));

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: 특정 사용자 정보 수정 (관리자용)
 *     description: 관리자가 ID로 특정 사용자의 정보를 수정합니다.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.patch('/:id', authenticate, isAdmin, asyncHandler(userController.updateUser));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 특정 사용자 삭제 (관리자용)
 *     description: 관리자가 ID로 특정 사용자를 삭제합니다.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.delete('/:id', authenticate, isAdmin, asyncHandler(userController.deleteUser));

export default router;
