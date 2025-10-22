import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { uploadCsv } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';
import carController from '../controllers/car-controller.js';

import {
  createCarSchema,
  updateCarSchema,
  carQuerySchema,
  carIdParamSchema,
} from '../dtos/car-dto.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CarResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         carNumber:
 *           type: string
 *         manufacturer:
 *           type: string
 *         model:
 *           type: string
 *         type:
 *           type: string
 *         manufacturingYear:
 *           type: integer
 *         mileage:
 *           type: integer
 *         price:
 *           type: integer
 *         accidentCount:
 *           type: integer
 *         explanation:
 *           type: string
 *         accidentDetails:
 *           type: string
 *         status:
 *           type: string
 *           enum: [possession, contractProceeding, contractCompleted]
 *     CarModelResponse:
 *       type: object
 *       properties:
 *         manufacturer:
 *           type: string
 *         models:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: 신규 차량 등록
 *     tags: [Car]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carNumber, manufacturer, model, manufacturingYear, mileage, price, accidentCount]
 *             properties:
 *               carNumber:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturingYear:
 *                 type: integer
 *                 description: "1900 ~ 현재년도+1"
 *               mileage:
 *                 type: integer
 *                 description: "0 ~ 1,000,000"
 *               price:
 *                 type: integer
 *                 description: "0 ~ 1,000,000,000"
 *               accidentCount:
 *                 type: integer
 *                 description: "0 ~ 100"
 *               explanation:
 *                 type: string
 *               accidentDetails:
 *                 type: string
 *     responses:
 *       201:
 *         description: 차량 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarResponse'
 */
router.post(
  '/',
  authenticate,
  validate(createCarSchema, 'body'),
  asyncHandler(carController.create),
);

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: 차량 목록 조회
 *     tags: [Car]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [possession, contractProceeding, contractCompleted, total]
 *       - in: query
 *         name: searchBy
 *         schema:
 *           type: string
 *           enum: [carNumber, model]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 차량 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarResponse'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItemCount:
 *                   type: integer
 */
router.get(
  '/',
  authenticate,
  validate(carQuerySchema, 'query'),
  asyncHandler(carController.getAll),
);

/**
 * @swagger
 * /cars/models:
 *   get:
 *     summary: 차량 제조사/모델 목록 조회
 *     tags: [Car]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarModelResponse'
 */
router.get('/models', authenticate, asyncHandler(carController.getModels));

/**
 * @swagger
 * /cars/{carId}:
 *   get:
 *     summary: 차량 상세 조회
 *     tags: [Car]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarResponse'
 *       404:
 *         description: 차량을 찾을 수 없음
 */
router.get(
  '/:carId',
  authenticate,
  validate(carIdParamSchema, 'params'),
  asyncHandler(carController.getById),
);

/**
 * @swagger
 * /cars/{carId}:
 *   patch:
 *     summary: 차량 정보 수정
 *     tags: [Car]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               # create와 동일하나, 모두 optional
 *               carNumber:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturingYear:
 *                 type: integer
 *               mileage:
 *                 type: integer
 *               price:
 *                 type: integer
 *               accidentCount:
 *                 type: integer
 *               explanation:
 *                 type: string
 *               accidentDetails:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [possession, contractProceeding, contractCompleted]
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarResponse'
 *       404:
 *         description: 차량을 찾을 수 없음
 */
router.patch(
  '/:carId',
  authenticate,
  validate(updateCarSchema, 'body'),
  asyncHandler(carController.update),
);

/**
 * @swagger
 * /cars/{carId}:
 *   delete:
 *     summary: 차량 삭제
 *     tags: [Car]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 차량을 찾을 수 없음
 */
router.delete(
  '/:carId',
  authenticate,
  validate(carIdParamSchema, 'params'),
  asyncHandler(carController.delete),
);

/**
 * @swagger
 * /cars/upload:
 *   post:
 *     summary: 차량 데이터 대용량 업로드 (CSV)
 *     tags: [Car]
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
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "차량 데이터 업로드 완료"
 *                 insertedCount:
 *                   type: integer
 *       400:
 *         description: 파일이 없거나 지원하지 않는 형식
 */
router.post(
  '/upload',
  authenticate,
  uploadCsv.single('file'),
  asyncHandler(carController.uploadCsv),
);

export default router;