import { Router } from 'express';
import asyncHandler from '../configs/async-handler.js';
import companyController from '../controllers/company-controller.js';
import {
  createCompanySchema,
  getCompaniesSchema,
  companyIdParamsSchema,
  updateCompanySchema,
  getUsersByCompanySchema,
} from '../dtos/company-dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isAdmin } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         companyName:
 *           type: string
 *         companyCode:
 *           type: string
 *         userCount:
 *           type: integer
 *     UserWithCompanyResponse:
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
 *         company:
 *           type: object
 *           properties:
 *             companyName:
 *               type: string
 */

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: 회사 등록 (관리자용)
 *     description: 새로운 회사를 시스템에 등록합니다. 관리자 권한이 필요합니다.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, companyCode]
 *             properties:
 *               companyName:
 *                 type: string
 *               companyCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회사 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       403:
 *         description: 권한 없음
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createCompanySchema, 'body'),
  asyncHandler(companyController.create),
);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: 회사 목록 조회
 *     description: 페이지네이션 및 검색 기능과 함께 회사 목록을 조회합니다.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: searchBy
 *         schema:
 *           type: string
 *           enum: [companyName, companyCode]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회사 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompanyResponse'
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get(
  '/',
  authenticate,
  validate(getCompaniesSchema, 'query'),
  asyncHandler(companyController.getAll),
);

/**
 * @swagger
 * /companies/users:
 *   get:
 *     summary: 회사별 유저 목록 조회
 *     description: 특정 회사에 속한 유저 목록을 페이지네이션 및 검색 기능과 함께 조회합니다.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: searchBy
 *         schema:
 *           type: string
 *           enum: [companyName, name, email]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 유저 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserWithCompanyResponse'
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get(
  '/users',
  authenticate,
  validate(getUsersByCompanySchema, 'query'),
  asyncHandler(companyController.getUsersByCompany),
);

/**
 * @swagger
 * /companies/{companyId}:
 *   patch:
 *     summary: 회사 정보 수정 (관리자용)
 *     description: 특정 회사의 정보를 수정합니다. 관리자 권한이 필요합니다.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, companyCode]
 *             properties:
 *               companyName:
 *                 type: string
 *               companyCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회사 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 회사를 찾을 수 없음
 */
router.patch(
  '/:companyId',
  authenticate,
  isAdmin,
  validate(companyIdParamsSchema, 'params'),
  validate(updateCompanySchema, 'body'),
  asyncHandler(companyController.update),
);

/**
 * @swagger
 * /companies/{companyId}:
 *   delete:
 *     summary: 회사 삭제 (관리자용)
 *     description: 특정 회사를 삭제합니다. 관리자 권한이 필요합니다.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 회사 삭제 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 회사를 찾을 수 없음
 */
router.delete(
  '/:companyId',
  authenticate,
  isAdmin,
  validate(companyIdParamsSchema, 'params'),
  asyncHandler(companyController.delete),
);

export default router;
