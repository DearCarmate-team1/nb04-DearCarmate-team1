import { Router } from 'express';
import contractDocumentController from '../controllers/contract-document-controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadDocument } from '../configs/multer.js';
import asyncHandler from '../configs/async-handler.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContractDocumentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fileName:
 *           type: string
 *         fileKey:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         contractId:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /contractDocuments:
 *   get:
 *     summary: 계약서 목록 조회 (페이지네이션)
 *     tags: [ContractDocument]
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
 *     responses:
 *       200:
 *         description: 계약서 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItemCount:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       contractName:
 *                         type: string
 *                       resolutionDate:
 *                         type: string
 *                         format: date-time
 *                       documentCount:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       carNumber:
 *                         type: string
 *                       documents:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/ContractDocumentResponse'
 */
router.get("/", authenticate, asyncHandler(contractDocumentController.list));

/**
 * @swagger
 * /contractDocuments/draft:
 *   get:
 *     summary: 초안 계약서 목록 조회 (contractId가 null인 계약서)
 *     tags: [ContractDocument]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 초안 계약서 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContractDocumentResponse'
 */
router.get("/draft", authenticate, asyncHandler(contractDocumentController.draftList));

/**
 * @swagger
 * /contractDocuments/upload:
 *   post:
 *     summary: 계약서 파일 업로드
 *     description: PDF, DOC, DOCX 파일을 업로드합니다. contractId를 함께 전송하면 해당 계약에 연결됩니다.
 *     tags: [ContractDocument]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 계약서 파일 (PDF, DOC, DOCX)
 *               contractId:
 *                 type: integer
 *                 description: 연결할 계약 ID (선택사항)
 *     responses:
 *       201:
 *         description: 계약서 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractDocumentResponse'
 *       400:
 *         description: 파일이 없거나 지원하지 않는 형식
 */
router.post(
  '/upload',
  authenticate,
  uploadDocument.single('file'),
  asyncHandler(contractDocumentController.upload)
);

/**
 * @swagger
 * /contractDocuments/download:
 *   get:
 *     summary: 토큰 기반 계약서 다운로드 (이메일 링크용)
 *     description: 인증이 필요 없는 다운로드 엔드포인트. 이메일로 전송된 링크에서 사용됩니다.
 *     tags: [ContractDocument]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 다운로드 토큰 (JWT)
 *     responses:
 *       200:
 *         description: 파일 다운로드 성공
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/msword:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: 토큰이 제공되지 않음
 *       401:
 *         description: 유효하지 않은 토큰
 *       404:
 *         description: 파일을 찾을 수 없음
 */
router.get(
  "/download",
  asyncHandler(contractDocumentController.downloadWithToken)
);

/**
 * @swagger
 * /contractDocuments/{contractDocumentId}/download:
 *   get:
 *     summary: 계약서 다운로드 (인증 필요)
 *     description: 인증된 사용자가 특정 계약서를 다운로드합니다.
 *     tags: [ContractDocument]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractDocumentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 계약서 문서 ID
 *     responses:
 *       200:
 *         description: 파일 다운로드 성공
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/msword:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: 계약서를 찾을 수 없음
 */
router.get(
  "/:contractDocumentId/download",
  authenticate,
  asyncHandler(contractDocumentController.download)
);

export default router;
