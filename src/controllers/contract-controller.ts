import { Request, Response } from 'express';
import contractService from '../services/contract-service.js';
import type {
  ContractResponseModel,
  ContractKanbanResponse,
  ContractDocumentListResponse,
  SelectListItem,
} from '../types/contract.js';
import type { ContractQueryDto, ContractDocumentQueryDto } from '../dtos/contract-dto.js';

const contractController = {
  // 📝 계약 등록
  async create(req: Request, res: Response): Promise<void> {
    const result: ContractResponseModel = await contractService.create(req.user, req.body);
    res.status(201).json(result);
  },

  // 📋 계약 목록 조회 (칸반 형태)
  async list(req: Request, res: Response): Promise<void> {
    const result: ContractKanbanResponse = await contractService.list(
      req.user,
      req.query as unknown as ContractQueryDto,
    );
    res.status(200).json(result);
  },

  // 🔍 계약 상세 조회
  async detail(req: Request, res: Response): Promise<void> {
    const result: ContractResponseModel = await contractService.detail(
      req.user,
      Number(req.params.contractId),
    );
    res.status(200).json(result);
  },

  // ✏️ 계약 수정
  async update(req: Request, res: Response): Promise<void> {
    // 디버깅: 프론트엔드에서 보낸 데이터 확인
    console.log('🔍 계약 수정 요청 데이터:', JSON.stringify(req.body, null, 2));
    console.log('🔍 contractDocuments:', req.body.contractDocuments);

    const result: ContractResponseModel = await contractService.update(
      req.user,
      Number(req.params.contractId),
      req.body,
    );
    res.status(200).json(result);
  },

  // 🗑️ 계약 삭제
  async delete(req: Request, res: Response): Promise<void> {
    const result = await contractService.remove(req.user, Number(req.params.contractId));
    res.status(200).json(result);
  },

  // 🚗 계약용 차량 목록 조회
  async getCarsForContract(req: Request, res: Response): Promise<void> {
    const result: SelectListItem[] = await contractService.getCarsForContract(req.user);
    res.status(200).json(result);
  },

  // 👥 계약용 고객 목록 조회
  async getCustomersForContract(req: Request, res: Response): Promise<void> {
    const result: SelectListItem[] = await contractService.getCustomersForContract(req.user);
    res.status(200).json(result);
  },

  // 👤 계약용 유저 목록 조회
  async getUsersForContract(req: Request, res: Response): Promise<void> {
    const result: SelectListItem[] = await contractService.getUsersForContract(req.user);
    res.status(200).json(result);
  },

  // 📄 계약서 업로드용 계약 목록 조회 (페이지네이션)
  async getForDocumentUpload(req: Request, res: Response): Promise<void> {
    const result: ContractDocumentListResponse = await contractService.getForDocumentUpload(
      req.user,
      req.query as unknown as ContractDocumentQueryDto,
    );
    res.status(200).json(result);
  },

  // 🎯 계약서 추가용 계약 목록 조회 (선택 리스트용)
  async getForUpload(req: Request, res: Response): Promise<void> {
    const result: SelectListItem[] = await contractService.getForUpload(req.user);
    res.status(200).json(result);
  },
};

export default contractController;
