import contractRepository from '../repositories/contract-repository.js';
import carRepository from '../repositories/car-repository.js';
// import customerRepository from '../repositories/customer-repository.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../configs/custom-error.js';
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

/**
 * 계약 상태에 따른 차량 상태 결정
 */
function getCarStatusFromContractStatus(contractStatus: ContractStatus): CarStatus {
  switch (contractStatus) {
    case 'carInspection':
    case 'priceNegotiation':
    case 'contractDraft':
      return 'contractProceeding';
    case 'contractSuccessful':
      return 'contractCompleted';
    case 'contractFailed':
      return 'possession';
    default:
      return 'contractProceeding';
  }
}

const contractService = {
  /** -------------------------------------------------
   * 📝 계약 생성
   * ------------------------------------------------- */
  async create(user: any, dto: CreateContractDto): Promise<ContractResponseModel> {
    // 차량 존재 및 권한 검증
    const car = await carRepository.findById(dto.carId);
    if (!car) throw new NotFoundError('차량을 찾을 수 없습니다.');
    if (car.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 고객 존재 및 권한 검증
    // const customer = await customerRepository.findById(dto.customerId); // 리팩토링 필요
    const customer = await contractRepository.customerFindById(dto.customerId);
    if (!customer) throw new NotFoundError('고객을 찾을 수 없습니다.');
    if (customer.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

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

  /** -------------------------------------------------
   * 📋 계약 목록 조회 (칸반 형태 - status별 그룹화)
   * ------------------------------------------------- */
  async list(user: any, query: ContractQueryDto): Promise<ContractKanbanResponse> {
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

  /** -------------------------------------------------
   * 🔍 계약 상세 조회
   * ------------------------------------------------- */
  async detail(user: any, contractId: number): Promise<ContractResponseModel> {
    const contract = await contractRepository.findById(contractId);
    if (!contract) throw new NotFoundError('계약을 찾을 수 없습니다.');
    if (contract.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    const entity = ContractMapper.fromPrisma(contract);
    return ContractMapper.toResponseModel(entity);
  },

  /** -------------------------------------------------
   * ✏️ 계약 수정
   * ------------------------------------------------- */
  async update(
    user: any,
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
    //   const customer = await customerRepository.findById(dto.customerId); // 리팩토링 필요
      const customer = await contractRepository.customerFindById(dto.customerId);
      if (!customer) throw new NotFoundError('고객을 찾을 수 없습니다.');
      if (customer.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');
    }

    // contractDocuments 처리 (파일 업로드 후 계약에 연결)
    if (dto.contractDocuments !== undefined) {
      // 1. 먼저 기존 계약에 연결된 모든 문서의 contractId를 null로 초기화 (연결 해제)
      await contractRepository.disconnectAllDocuments(contractId);

      // 2. 새로 선택한 문서들만 현재 계약에 연결
      if (dto.contractDocuments.length > 0) {
        await Promise.all(
          dto.contractDocuments.map(async (doc) => {
            await contractRepository.updateContractDocument(doc.id, contractId);
          })
        );
      }
    }

    // DTO → Input 변환
    const updateInput = ContractMapper.fromUpdateDto(dto);

    // 계약 수정
    const updated = await contractRepository.update(contractId, updateInput);

    // 차량 상태 업데이트
    // 1. 차량이 변경된 경우
    if (isCarChanged) {
      // 기존 차량을 possession으로 복원
      await carRepository.updateStatus(oldCarId, 'possession');
      // 새 차량을 현재 계약 상태에 맞게 변경
      const newCarStatus = getCarStatusFromContractStatus(updated.status);
      await carRepository.updateStatus(updated.carId, newCarStatus);
    }
    // 2. 차량은 그대로인데 계약 상태만 변경된 경우
    else if (dto.status) {
      const carStatus = getCarStatusFromContractStatus(dto.status);
      await carRepository.updateStatus(updated.carId, carStatus);
    }

    // Entity 변환 후 응답
    const entity = ContractMapper.fromPrisma(updated);
    return ContractMapper.toResponseModel(entity);
  },

  /** -------------------------------------------------
   * 🗑️ 계약 삭제
   * ------------------------------------------------- */
  async remove(user: any, contractId: number): Promise<{ message: string }> {
    const contract = await contractRepository.findById(contractId);
    if (!contract) throw new NotFoundError('계약을 찾을 수 없습니다.');
    if (contract.companyId !== user.companyId) throw new ForbiddenError('권한이 없습니다.');

    // 담당자만 삭제 가능 (userId 검증)
    if (contract.userId !== user.id) {
      throw new ForbiddenError('담당자만 삭제가 가능합니다.');
    }

    // 계약 삭제 전 차량 ID 저장
    const carId = contract.carId;

    await contractRepository.delete(contractId);

    // 차량 상태를 'possession'으로 복원
    await carRepository.updateStatus(carId, 'possession');

    return { message: '계약 삭제 성공' };
  },

  /** -------------------------------------------------
   * 🚗 계약용 차량 목록 조회
   * ------------------------------------------------- */
  async getCarsForContract(user: any): Promise<SelectListItem[]> {
    const cars = await contractRepository.findCarsForContract(user.companyId);

    return cars.map((car) => ({
      id: car.id,
      data: `${car.model.model}(${car.carNumber})`,
    }));
  },

  /** -------------------------------------------------
   * 👥 계약용 고객 목록 조회
   * ------------------------------------------------- */
  async getCustomersForContract(user: any): Promise<SelectListItem[]> {
    const customers = await contractRepository.findCustomersForContract(user.companyId);

    return customers.map((customer) => ({
      id: customer.id,
      data: `${customer.name}(${customer.email ?? '이메일 없음'})`,
    }));
  },

  /** -------------------------------------------------
   * 👤 계약용 유저 목록 조회
   * ------------------------------------------------- */
  async getUsersForContract(user: any): Promise<SelectListItem[]> {
    const users = await contractRepository.findUsersForContract(user.companyId);

    return users.map((u) => ({
      id: u.id,
      data: `${u.name}(${u.email})`,
    }));
  },

  /** -------------------------------------------------
   * 📁 계약서 업로드 계약 목록 조회 (페이지네이션)
   * ------------------------------------------------- */
  async getForDocumentUpload(
    user: any,
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

  /** -------------------------------------------------
   * 🎯 계약서 추가용 계약 목록 조회 (선택 리스트용 - 간단)
   * ------------------------------------------------- */
  async getForUpload(user: any): Promise<SelectListItem[]> {
    const contracts = await contractRepository.findForUpload(user.companyId);

    return contracts.map((c) =>
      ContractMapper.toSelectListItem(c.car.model.model, c.customer.name, c.id),
    );
  },
};

export default contractService;
