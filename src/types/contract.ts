import type { ContractStatus } from '@prisma/client';

/** 알람 엔티티 */
export interface NotificationEntity {
  id: number;
  alarmTime: Date;
  meetingId: number;
}

/** 미팅 엔티티 */
export interface MeetingEntity {
  id: number;
  date: Date;
  contractId: number;
  notifications: NotificationEntity[];
}

/** 계약서 파일 엔티티 */
export interface ContractDocumentEntity {
  id: number;
  fileName: string;
  fileKey: string;
  mimeType: string;
  size: number;
  contractId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 계약 엔티티 */
export interface ContractEntity {
  id: number;
  status: ContractStatus;
  contractPrice: number;
  resolutionDate: Date | null;
  carId: number;
  userId: number;
  customerId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  // 관계 정보
  car: {
    id: number;
    carNumber: string;
    model: {
      manufacturer: string;
      model: string;
    };
  };
  customer: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  meetings: MeetingEntity[];
  documents?: ContractDocumentEntity[] | undefined;
}

/** 알람 생성 입력 */
export interface NotificationCreateInput {
  alarmTime: Date;
}

/** 미팅 생성 입력 */
export interface MeetingCreateInput {
  date: Date;
  notifications: {
    create: NotificationCreateInput[];
  };
}

/** 계약 생성 입력 */
export interface ContractCreateInput {
  status?: ContractStatus;
  contractPrice: number;
  resolutionDate?: Date;
  carId: number;
  userId: number;
  customerId: number;
  companyId: number;
  meetings?: {
    create: MeetingCreateInput[];
  };
}

/** 계약 수정 입력 */
export interface ContractUpdateInput {
  status?: ContractStatus;
  contractPrice?: number;
  resolutionDate?: Date;
  carId?: number;
  userId?: number;
  customerId?: number;
  meetings?: {
    deleteMany?: {};
    create?: MeetingCreateInput[];
  };
}

/** 미팅 응답 모델 */
export interface MeetingResponseModel {
  date: string; // ISO 8601
  alarms: string[]; // ISO 8601
}

/** 계약서 파일 응답 모델 */
export interface ContractDocumentResponseModel {
  id: number;
  fileName: string;
}

/** 계약 상세 응답 모델 */
export interface ContractResponseModel {
  id: number;
  status: ContractStatus;
  resolutionDate: string | null; // ISO 8601
  contractPrice: number;
  contractName: string; // 동적 생성 (차량모델 - 고객명 고객님)
  meetings: MeetingResponseModel[];
  user: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  };
  car: {
    id: number;
    model: string;
  };
}

/** 계약 목록 아이템 (칸반용) */
export interface ContractListItem {
  id: number;
  contractName: string; // 동적 생성
  car: {
    id: number;
    model: string;
  };
  customer: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  meetings: MeetingResponseModel[];
  contractPrice: number;
  resolutionDate: string | null; // ISO 8601
  status: ContractStatus;
}

/** 상태별 계약 그룹 */
export interface ContractsByStatus {
  totalItemCount: number;
  data: ContractListItem[];
}

/** 칸반 응답 (status별 그룹화) */
export interface ContractKanbanResponse {
  carInspection: ContractsByStatus;
  priceNegotiation: ContractsByStatus;
  contractDraft: ContractsByStatus;
  contractSuccessful: ContractsByStatus;
  contractFailed: ContractsByStatus;
}

/** 계약서 업로드 계약 목록 아이템 */
export interface ContractDocumentListItem {
  id: number;
  contractName: string; // 동적 생성
  resolutionDate: string; // ISO 8601
  documentCount: number;
  userName: string;
  carNumber: string;
  documents: ContractDocumentResponseModel[];
}

/** 계약서 업로드 계약 목록 응답 (페이지네이션) */
export interface ContractDocumentListResponse {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: ContractDocumentListItem[];
}

/** 선택 리스트 아이템 응답 */
export interface SelectListItem {
  id: number;
  data: string;
}
