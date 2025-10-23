import { Router } from 'express';
import { CustomerController } from '../controllers/customer-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadCsv } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();
const controller = new CustomerController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         gender:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         ageGroup:
 *           type: string
 *           nullable: true
 *         region:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *         memo:
 *           type: string
 *           nullable: true
 *         contractCount:
 *           type: integer
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: 신규 고객 등록
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, gender, phoneNumber]
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               ageGroup:
 *                 type: string
 *               region:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               memo:
 *                 type: string
 *     responses:
 *       201:
 *         description: 고객 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 */
router.post('/', authenticate, asyncHandler(controller.create.bind(controller)));

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: 고객 목록 조회
 *     tags: [Customer]
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
 *           enum: [name, email]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 고객 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomerResponse'
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', authenticate, asyncHandler(controller.list.bind(controller)));

/**
 * @swagger
 * /customers/{customerId}:
 *   get:
 *     summary: 고객 상세 조회
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 고객 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       404:
 *         description: 고객을 찾을 수 없음
 */
router.get('/:customerId', authenticate, asyncHandler(controller.detail.bind(controller)));

/**
 * @swagger
 * /customers/{customerId}:
 *   patch:
 *     summary: 고객 정보 수정
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               ageGroup:
 *                 type: string
 *               region:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               memo:
 *                 type: string
 *     responses:
 *       200:
 *         description: 고객 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       404:
 *         description: 고객을 찾을 수 없음
 */
router.patch('/:customerId', authenticate, asyncHandler(controller.update.bind(controller)));

/**
 * @swagger
 * /customers/{customerId}:
 *   delete:
 *     summary: 고객 삭제
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 고객 삭제 성공
 *       404:
 *         description: 고객을 찾을 수 없음
 */
router.delete('/:customerId', authenticate, asyncHandler(controller.delete.bind(controller)));

/**
 * @swagger
 * /customers/upload:
 *   post:
 *     summary: 고객 데이터 대용량 업로드 (CSV/XLSX)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 파일 업로드 및 데이터 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "고객 데이터 업로드 완료"
 *                 insertedCount:
 *                   type: integer
 *       400:
 *         description: 파일이 없거나 지원하지 않는 형식
 */
router.post(
  '/upload',
  authenticate,
  uploadCsv.single('file'),
  asyncHandler(controller.bulkUpload.bind(controller)),
);

export default router;