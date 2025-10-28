import contractRepository from '../repositories/contract-repository.js';
import carRepository from '../repositories/car-repository.js';
import customerRepository from '../repositories/customer-repository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../configs/custom-error.js';
import contractDocumentRepository from '../repositories/contract-document-repository.js';
import { deletePhysicalFile } from '../utils/file-delete.js';
import { cleanupContractDocuments } from '../utils/contract-cleanup.js';
import emailService from './email-service.js';
import prisma from '../configs/prisma-client.js';
import type {
  CreateContractDto,
  UpdateContractDto,
  ContractQueryDto,
  ContractDocumentQueryDto,
} from '../dtos/contract-dto.js';
import type {
  ContractResponseModel,
  ContractKanbanResponse,
  ContractDocumentListResponse,
  SelectListItem,
} from '../types/contract.js';
import { ContractMapper } from '../mappers/contract-mapper.js';
import type { ContractStatus, CarStatus } from '@prisma/client';
import type { AuthUser } from '../types/auth-user.js';

// 계약 상태 상수 그룹
const IN_PROGRESS_STATUSES: ContractStatus[] = [
  'carInspection',
  'priceNegotiation',
  'contractDraft',
];
const SUCCESS_STATUS: ContractStatus = 'contractSuccessful';
const FAILED_STATUS: ContractStatus = 'contractFailed';

/**
 * 계약 상태에 따른 차량 상태 결정
 */
function getCarStatusFromContractStatus(contractStatus: ContractStatus): CarStatus {
  if (IN_PROGRESS_STATUSES.includes(contractStatus)) {
    return 'contractProceeding';
  }
  if (contractStatus === SUCCESS_STATUS) {
    return 'contractCompleted';
  }
  if (contractStatus === FAILED_STATUS) {
    return 'possession';
  }
  return 'contractProceeding'; // fallback
}

const contractService = {
  /** 계약 생성 */
  async create(user: AuthUser, dto: CreateContractDto): Promise<ContractResponseModel> {
    // 차량 존재 및 권한 검증
    const car = await carRepository.findById(dto.carId);
    if (!car) throw new NotFoundError('차량을 찾을 수 없습니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 고객 존재 및 권한 검증
    const customer = await customerRepository.findById(user.companyId, dto.customerId);
    if (!customer) throw new NotFoundError('고객을 찾을 수 없습니다.');

    // contractPrice는 차량 가격으로 자동 설정
    const contractPrice = car.price;

    // DTO → Input 변환
    const createInput = ContractMapper.fromCreateDto(dto, user.id, user.companyId, contractPrice);

    // 계약 생성
    const created = await contractRepository.create(createInput);

    // 차량 상태를 'contractProceeding'으로 변경
    await carRepository.updateStatus(dto.carId, 'contractProceeding');

    // Entity 변환 후 응답
    const entity = ContractMapper.fromPrisma(created);
    return ContractMapper.toResponseModel(entity);
  },

  /** 계약 목록 조회 (칸반 형태 - status별 그룹화) */
  async list(user: AuthUser, query: ContractQueryDto): Promise<ContractKanbanResponse> {
    const { searchBy, keyword } = query;

    // 회사별 계약 조회
    const contracts = await contractRepository.findByCompanyWithFilters({
      companyId: user.companyId,
      ...(searchBy && { searchBy }),
      ...(keyword && { keyword }),
    });

    // Entity 변환
    const entities = contracts.map((c) => ContractMapper.fromPrisma(c));

    // 칸반 형식 변환 (status별 그룹화)
    return ContractMapper.toKanbanResponse(entities);
  },

  /** 계약 상세 조회 */
  async detail(user: AuthUser, contractId: number): Promise<ContractResponseModel> {
    const contract = await contractRepository.findById(contractId);
    if (!contract) throw new NotFoundError('계약을 찾을 수 없습니다.');
    if (contract.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    const entity = ContractMapper.fromPrisma(contract);
    return ContractMapper.toResponseModel(entity);
  },

  /** 계약 수정 */
  async update(
    user: AuthUser,
    contractId: number,
    dto: UpdateContractDto,
  ): Promise<ContractResponseModel> {
    const contract = await contractRepository.findById(contractId);
    if (!contract) throw new NotFoundError('계약을 찾을 수 없습니다.');
    if (contract.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 담당자만 수정 가능 (userId 검증)
    if (contract.userId !== user.id) {
      throw new ForbiddenError('담당자만 수정이 가능합니다.');
    }

    const oldStatus = contract.status;
    const newStatus = dto.status;

    // 실패 → 성공 직행 금지
    if (newStatus && oldStatus === FAILED_STATUS && newStatus === SUCCESS_STATUS) {
      throw new BadRequestError('실패한 계약은 성공 상태로 직접 변경할 수 없습니다.');
    }

    // 차량 상태 검증 (실패 → 진행중으로 변경 시만)
    // 완료 → 진행중은 같은 계약의 차량을 재사용하므로 검증 불필요
    if (newStatus && oldStatus === FAILED_STATUS && IN_PROGRESS_STATUSES.includes(newStatus)) {
      const car = await carRepository.findById(contract.carId);
      if (!car) throw new NotFoundError('차량을 찾을 수 없습니다.');

      if (car.status !== 'possession') {
        throw new BadRequestError('해당 차량은 현재 사용할 수 없습니다 (이미 계약 진행 중이거나 완료됨)');
      }
    }

    // 차량 변경 여부 확인
    const isCarChanged = dto.carId !== undefined && dto.carId !== contract.carId;
    const oldCarId = contract.carId;

    // 차량/고객 변경 시 존재 및 권한 검증
    if (isCarChanged && dto.carId !== undefined) {
      const car = await carRepository.findById(dto.carId);
      if (!car) throw new NotFoundError('차량을 찾을 수 없습니다.');
      if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');
    }

    if (dto.customerId && dto.customerId !== contract.customerId) {
      const customer = await customerRepository.findById(user.companyId, dto.customerId);
      if (!customer) throw new NotFoundError('고객을 찾을 수 없습니다.');
    }

    // 계약서 물리 삭제 (완료 → 다른 상태)
    if (newStatus && oldStatus === SUCCESS_STATUS && newStatus !== SUCCESS_STATUS) {
      const existingDocuments = await contractDocumentRepository.findByContractId(contractId);

      if (existingDocuments.length > 0) {
        // 1. 물리 파일 삭제
        for (const doc of existingDocuments) {
          await deletePhysicalFile(doc.filePath, 'raw');
        }

        // 2. DB에서 문서 삭제
        await Promise.all(
          existingDocuments.map((doc: any) => contractDocumentRepository.delete(doc.id))
        );
      }
    }

    // contractDocuments 처리 (파일 업로드 후 계약에 연결)
    if (dto.contractDocuments !== undefined) {
      // 1. 기존 계약에 연결된 문서 조회
      const existingDocuments = await contractDocumentRepository.findByContractId(contractId);

      // 2. 새로 선택한 문서 ID 목록
      const newDocumentIds = dto.contractDocuments.map(doc => doc.id);

      // 3. 제거될 문서 찾기 (기존 문서 중 새 목록에 없는 것)
      const documentsToDelete = existingDocuments.filter(
        doc => !newDocumentIds.includes(doc.id)
      );

      // 4. 제거될 문서들의 물리적 파일 삭제
      for (const doc of documentsToDelete) {
        await deletePhysicalFile(doc.filePath, 'raw');
      }

      // 5. 기존 계약에 연결된 모든 문서의 contractId를 null로 초기화 (연결 해제)
      await contractRepository.disconnectAllDocuments(contractId);

      // 6. 제거될 문서들 DB에서 완전 삭제
      if (documentsToDelete.length > 0) {
        await Promise.all(
          documentsToDelete.map((doc: any) => contractDocumentRepository.delete(doc.id))
        );
      }

      // 7. 새로 선택한 문서들만 현재 계약에 연결
      if (dto.contractDocuments.length > 0) {
        await Promise.all(
          dto.contractDocuments.map(async (doc) => {
            await contractRepository.updateContractDocument(doc.id, contractId);
          })
        );

        // 8. 계약서 업로드 완료 시 이메일 발송
        const customer = await customerRepository.findById(user.companyId, contract.customerId);
        const car = await carRepository.findById(contract.carId);

        if (customer?.email && car) {
          const carName = `${car.model.manufacturer} ${car.model.model} (${car.carNumber})`;

          emailService.sendContractEmail({
            customerEmail: customer.email,
            customerName: customer.name,
            customerId: customer.id,
            contractId,
            carName,
            documents: dto.contractDocuments.map(doc => ({
              id: doc.id,
              fileName: doc.fileName,
            })),
          }).catch((err) => {
            console.error('[ERROR] Email send failed:', err);
          });
        }
      }
    }

    // DTO → Input 변환
    const updateInput = ContractMapper.fromUpdateDto(dto);

    // 트랜잭션: 계약 + 차량 상태 동시 업데이트
    const updated = await prisma.$transaction(async (tx) => {
      // 1. 계약 수정 (Repository 위임)
      const updatedContract = await contractRepository.update(contractId, updateInput, tx);

      // 2. 차량 상태 업데이트 (Repository 위임)
      if (isCarChanged) {
        // 차량이 변경된 경우: 기존 차량 복원 + 새 차량 변경
        await carRepository.updateStatus(oldCarId, 'possession', tx);
        const newCarStatus = getCarStatusFromContractStatus(updatedContract.status);
        await carRepository.updateStatus(updatedContract.carId, newCarStatus, tx);
      } else if (newStatus) {
        // 차량은 그대로, 계약 상태만 변경된 경우
        const carStatus = getCarStatusFromContractStatus(newStatus);
        await carRepository.updateStatus(updatedContract.carId, carStatus, tx);
      }

      return updatedContract;
    });

    // Entity 변환 후 응답
    const entity = ContractMapper.fromPrisma(updated);
    return ContractMapper.toResponseModel(entity);
  },

  /** 계약 삭제 (물리적 파일도 함께 삭제) */
  async remove(user: AuthUser, contractId: number): Promise<{ message: string }> {
    const contract = await contractRepository.findById(contractId);
    if (!contract) throw new NotFoundError('계약을 찾을 수 없습니다.');
    if (contract.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 담당자만 삭제 가능 (userId 검증)
    if (contract.userId !== user.id) {
      throw new ForbiddenError('담당자만 삭제가 가능합니다.');
    }

    // 계약 삭제 전 차량 ID 저장
    const carId = contract.carId;

    // 관련 문서들의 물리적 파일 삭제
    await cleanupContractDocuments([contractId]);

    // DB에서 계약 삭제 (Cascade가 문서 레코드 자동 삭제)
    await contractRepository.delete(contractId);

    // 차량 상태를 'possession'으로 복원
    await carRepository.updateStatus(carId, 'possession');

    return { message: '계약 삭제 성공' };
  },

  /** 계약용 차량 목록 조회 */
  async getCarsForContract(user: AuthUser): Promise<SelectListItem[]> {
    const cars = await contractRepository.findCarsForContract(user.companyId);

    return cars.map((car) => ({
      id: car.id,
      data: `${car.model.model}(${car.carNumber})`,
    }));
  },

  /** 계약용 고객 목록 조회 */
  async getCustomersForContract(user: AuthUser): Promise<SelectListItem[]> {
    const customers = await contractRepository.findCustomersForContract(user.companyId);

    return customers.map((customer) => ({
      id: customer.id,
      data: `${customer.name}(${customer.email ?? '이메일 없음'})`,
    }));
  },

  /** 계약용 유저 목록 조회 */
  async getUsersForContract(user: AuthUser): Promise<SelectListItem[]> {
    const users = await contractRepository.findUsersForContract(user.companyId);

    return users.map((u) => ({
      id: u.id,
      data: `${u.name}(${u.email})`,
    }));
  },

  /** 계약서 업로드 계약 목록 조회 (페이지네이션) */
  async getForDocumentUpload(
    user: AuthUser,
    query: ContractDocumentQueryDto,
  ): Promise<ContractDocumentListResponse> {
    const { page, pageSize, searchBy, keyword } = query;

    const { totalItemCount, data } = await contractRepository.findForDocumentUpload({
      companyId: user.companyId,
      page,
      pageSize,
      ...(searchBy && { searchBy }),
      ...(keyword && { keyword }),
    });

    const entities = data.map((c) => ContractMapper.fromPrisma(c));
    const totalPages = Math.ceil(totalItemCount / pageSize);

    return ContractMapper.toDocumentListResponse(entities, page, totalPages, totalItemCount);
  },

  /** 계약서 추가용 계약 목록 조회 (선택 리스트용 - 간단) */
  async getForUpload(user: AuthUser): Promise<SelectListItem[]> {
    const contracts = await contractRepository.findForUpload(user.companyId);

    return contracts.map((c) =>
      ContractMapper.toSelectListItem(c.car.model.model, c.customer.name, c.id),
    );
  },
};

export default contractService;
