import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../configs/async-handler.js';
import contractController from '../controllers/contract-controller.js';

import {
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
  contractIdParamSchema,
} from '../dtos/contract-dto.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SelectListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         data:
 *           type: string
 *           description: "표시될 텍스트 (예: '모델명(차량번호)')"
 *     ContractResponse:
 *       type: object
 *       properties:
 *         # ... contract-mapper.ts의 toResponseModel 참조
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *         contractPrice:
 *           type: integer
 *         resolutionDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         carName:
 *           type: string
 *         carNumber:
 *           type: string
 *         customerName:
 *           type: string
 *         userName:
 *           type: string
 *         meetings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               alarms:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *         contractDocuments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               fileName:
 *                 type: string
 */

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: 신규 계약 등록
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, customerId]
 *             properties:
 *               carId:
 *                 type: integer
 *               customerId:
 *                 type: integer
 *               meetings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     alarms:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date-time
 *     responses:
 *       201:
 *         description: 계약 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractResponse'
 */
router.post(
  '/',
  authenticate,
  validate(createContractSchema, 'body'),
  asyncHandler(contractController.create),
);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: 계약 목록 조회 (칸반 보드용)
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchBy
 *         schema:
 *           type: string
 *           enum: [customerName, userName]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 칸반 보드 형태의 계약 목록
 *         content:
 *           application/json:
 *             schema:
 *               # KanbanResponse 타입 참조
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ContractResponse'
 */
router.get(
  '/',
  authenticate,
  validate(contractQuerySchema, 'query'),
  asyncHandler(contractController.list),
);

/**
 * @swagger
 * /contracts/cars:
 *   get:
 *     summary: 계약 등록용 차량 목록 조회
 *     tags: [Contract]
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
 *                 $ref: '#/components/schemas/SelectListItem'
 */
router.get('/cars', authenticate, asyncHandler(contractController.getCarsForContract));

/**
 * @swagger
 * /contracts/customers:
 *   get:
 *     summary: 계약 등록용 고객 목록 조회
 *     tags: [Contract]
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
 *                 $ref: '#/components/schemas/SelectListItem'
 */
router.get('/customers', authenticate, asyncHandler(contractController.getCustomersForContract));

/**
 * @swagger
 * /contracts/users:
 *   get:
 *     summary: 계약 등록용 담당자 목록 조회
 *     tags: [Contract]
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
 *                 $ref: '#/components/schemas/SelectListItem'
 */
router.get('/users', authenticate, asyncHandler(contractController.getUsersForContract));

/**
 * @swagger
 * /contracts/{contractId}:
 *   patch:
 *     summary: 계약 정보 수정
 *     description: 계약 상태, 담당자, 차량, 고객, 미팅일정, 계약서 등을 수정합니다.
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             # updateContractSchema 참조
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [carInspection, priceNegotiation, contractDraft, contractSuccessful, contractFailed]
 *               # ... 기타 필드 생략
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractResponse'
 *       403:
 *         description: 권한 없음 (담당자가 아님)
 *       404:
 *         description: 계약을 찾을 수 없음
 */
router.patch(
  '/:contractId',
  authenticate,
  validate(contractIdParamSchema, 'params'),
  validate(updateContractSchema, 'body'),
  asyncHandler(contractController.update),
);

/**
 * @swagger
 * /contracts/{contractId}:
 *   delete:
 *     summary: 계약 삭제
 *     description: 특정 계약을 삭제합니다. 담당자만 삭제할 수 있습니다.
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       403:
 *         description: 권한 없음 (담당자가 아님)
 *       404:
 *         description: 계약을 찾을 수 없음
 */
router.delete(
  '/:contractId',
  authenticate,
  validate(contractIdParamSchema, 'params'),
  asyncHandler(contractController.delete),
);

export default router;