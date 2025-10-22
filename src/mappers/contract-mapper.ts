import type {
  ContractEntity,
  MeetingEntity,
  NotificationEntity,
  ContractResponseModel,
  ContractListItem,
  ContractKanbanResponse,
  ContractsByStatus,
  MeetingResponseModel,
  ContractCreateInput,
  ContractUpdateInput,
  MeetingCreateInput,
  ContractDocumentListItem,
  ContractDocumentListResponse,
  SelectListItem,
} from '../types/contract.js';
import type {
  Contract,
  Meeting,
  Notification,
  ContractDocument,
  ContractStatus,
} from '@prisma/client';
import type { CreateContractDto, UpdateContractDto } from '../dtos/contract-dto.js';

/** -------------------------------------------------
 * 🔄 Contract Mapper
 * - Prisma → Domain → Response 변환
 * - 데이터 정규화 (중복 제거, 단일 출처 관리)
 * - contractName 동적 생성
 * ------------------------------------------------- */
export const ContractMapper = {
  /** -------------------------------------------------
   * 📥 Prisma → Domain Entity 변환
   * ------------------------------------------------- */

  /** 🔔 Notification 변환 */
  fromPrismaNotification(notification: Notification): NotificationEntity {
    return {
      id: notification.id,
      alarmTime: notification.alarmTime,
      meetingId: notification.meetingId,
    };
  },

  /** 📅 Meeting 변환 */
  fromPrismaMeeting(meeting: Meeting & { notifications: Notification[] }): MeetingEntity {
    return {
      id: meeting.id,
      date: meeting.date,
      contractId: meeting.contractId,
      notifications: meeting.notifications.map((n) => this.fromPrismaNotification(n)),
    };
  },

  /** 📋 Contract 변환 (Prisma → Entity) */
  fromPrisma(
    contract: Contract & {
      car: { id: number; carNumber: string; model: { manufacturer: string; model: string } };
      customer: { id: number; name: string };
      user: { id: number; name: string };
      meetings: (Meeting & { notifications: Notification[] })[];
      documents?: ContractDocument[];
    },
  ): ContractEntity {
    return {
      id: contract.id,
      status: contract.status,
      contractPrice: contract.contractPrice,
      resolutionDate: contract.resolutionDate,
      carId: contract.carId,
      userId: contract.userId,
      customerId: contract.customerId,
      companyId: contract.companyId,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      car: {
        id: contract.car.id,
        carNumber: contract.car.carNumber,
        model: {
          manufacturer: contract.car.model.manufacturer,
          model: contract.car.model.model,
        },
      },
      customer: {
        id: contract.customer.id,
        name: contract.customer.name,
      },
      user: {
        id: contract.user.id,
        name: contract.user.name,
      },
      meetings: contract.meetings.map((m) => this.fromPrismaMeeting(m)),
      documents: contract.documents?.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileKey: d.fileKey,
        mimeType: d.mimeType,
        size: d.size,
        contractId: d.contractId,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    };
  },

  /** -------------------------------------------------
   * 📤 Entity → Response 변환
   * ------------------------------------------------- */

  /** ✨ contractName 동적 생성 함수 */
  generateContractName(carModel: string, customerName: string): string {
    return `${carModel} - ${customerName} 고객님`;
  },

  /** 📅 Meeting → MeetingResponseModel 변환 */
  toMeetingResponse(meeting: MeetingEntity): MeetingResponseModel {
    return {
      date: meeting.date.toISOString(),
      alarms: meeting.notifications.map((n) => n.alarmTime.toISOString()),
    };
  },

  /** 📋 ContractEntity → ContractResponseModel 변환 */
  toResponseModel(entity: ContractEntity): ContractResponseModel {
    return {
      id: entity.id,
      status: entity.status,
      resolutionDate: entity.resolutionDate ? entity.resolutionDate.toISOString() : null,
      contractPrice: entity.contractPrice,
      contractName: this.generateContractName(entity.car.model.model, entity.customer.name),
      meetings: entity.meetings.map((m) => this.toMeetingResponse(m)),
      user: {
        id: entity.user.id,
        name: entity.user.name,
      },
      customer: {
        id: entity.customer.id,
        name: entity.customer.name,
      },
      car: {
        id: entity.car.id,
        model: entity.car.model.model,
      },
    };
  },

  /** 📋 ContractEntity → ContractListItem 변환 (칸반용) */
  toListItem(entity: ContractEntity): ContractListItem {
    return {
      id: entity.id,
      contractName: this.generateContractName(entity.car.model.model, entity.customer.name),
      car: {
        id: entity.car.id,
        model: entity.car.model.model,
      },
      customer: {
        id: entity.customer.id,
        name: entity.customer.name,
      },
      user: {
        id: entity.user.id,
        name: entity.user.name,
      },
      meetings: entity.meetings.map((m) => this.toMeetingResponse(m)),
      contractPrice: entity.contractPrice,
      resolutionDate: entity.resolutionDate ? entity.resolutionDate.toISOString() : null,
      status: entity.status,
    };
  },

  /** 📊 ContractEntity[] → ContractKanbanResponse 변환 (status별 그룹화) */
  toKanbanResponse(entities: ContractEntity[]): ContractKanbanResponse {
    const grouped: {
      carInspection: ContractEntity[];
      priceNegotiation: ContractEntity[];
      contractDraft: ContractEntity[];
      contractSuccessful: ContractEntity[];
      contractFailed: ContractEntity[];
    } = {
      carInspection: [],
      priceNegotiation: [],
      contractDraft: [],
      contractSuccessful: [],
      contractFailed: [],
    };

    // Status별로 그룹화
    entities.forEach((entity) => {
      grouped[entity.status].push(entity);
    });

    // 각 status별로 ContractsByStatus 생성
    return {
      carInspection: {
        totalItemCount: grouped.carInspection.length,
        data: grouped.carInspection.map((e) => this.toListItem(e)),
      },
      priceNegotiation: {
        totalItemCount: grouped.priceNegotiation.length,
        data: grouped.priceNegotiation.map((e) => this.toListItem(e)),
      },
      contractDraft: {
        totalItemCount: grouped.contractDraft.length,
        data: grouped.contractDraft.map((e) => this.toListItem(e)),
      },
      contractSuccessful: {
        totalItemCount: grouped.contractSuccessful.length,
        data: grouped.contractSuccessful.map((e) => this.toListItem(e)),
      },
      contractFailed: {
        totalItemCount: grouped.contractFailed.length,
        data: grouped.contractFailed.map((e) => this.toListItem(e)),
      },
    };
  },

  /** 📁 계약서 업로드 목록 변환 */
  toDocumentListItem(entity: ContractEntity): ContractDocumentListItem {
    return {
      id: entity.id,
      contractName: this.generateContractName(entity.car.model.model, entity.customer.name),
      resolutionDate: entity.resolutionDate
        ? entity.resolutionDate.toISOString()
        : new Date().toISOString(),
      documentCount: entity.documents?.length ?? 0,
      userName: entity.user.name,
      carNumber: entity.car.carNumber,
      documents:
        entity.documents?.map((d) => ({
          id: d.id,
          fileName: d.fileName,
        })) ?? [],
    };
  },

  /** 📁 계약서 업로드 목록 응답 변환 (페이지네이션) */
  toDocumentListResponse(
    entities: ContractEntity[],
    currentPage: number,
    totalPages: number,
    totalItemCount: number,
  ): ContractDocumentListResponse {
    return {
      currentPage,
      totalPages,
      totalItemCount,
      data: entities.map((e) => this.toDocumentListItem(e)),
    };
  },

  /** 🎯 선택 리스트 아이템 변환 (id + data) */
  toSelectListItem(carModel: string, customerName: string, id: number): SelectListItem {
    return {
      id,
      data: this.generateContractName(carModel, customerName),
    };
  },

  /** -------------------------------------------------
   * 📝 DTO → Input 변환
   * ------------------------------------------------- */

  /** 📝 CreateContractDto → ContractCreateInput 변환 */
  fromCreateDto(
    dto: CreateContractDto,
    userId: number,
    companyId: number,
    contractPrice: number,
  ): ContractCreateInput {
    const input: ContractCreateInput = {
      contractPrice,
      carId: dto.carId,
      userId,
      customerId: dto.customerId,
      companyId,
    };

    // meetings 변환
    if (dto.meetings && dto.meetings.length > 0) {
      input.meetings = {
        create: dto.meetings.map((m) => ({
          date: new Date(m.date),
          notifications: {
            create: (m.alarms ?? []).map((alarm) => ({
              alarmTime: new Date(alarm),
            })),
          },
        })),
      };
    }

    return input;
  },

  /** ✏️ UpdateContractDto → ContractUpdateInput 변환 */
  fromUpdateDto(dto: UpdateContractDto): ContractUpdateInput {
    const input: ContractUpdateInput = {};

    if (dto.status !== undefined) input.status = dto.status;
    if (dto.contractPrice !== undefined) input.contractPrice = dto.contractPrice;
    if (dto.resolutionDate !== undefined) input.resolutionDate = new Date(dto.resolutionDate);
    if (dto.carId !== undefined) input.carId = dto.carId;
    if (dto.userId !== undefined) input.userId = dto.userId;
    if (dto.customerId !== undefined) input.customerId = dto.customerId;

    // meetings 배열: repository에서 트랜잭션으로 처리
    if (dto.meetings !== undefined) {
      input.meetings = {
        create: dto.meetings.map((m) => ({
          date: new Date(m.date),
          notifications: {
            create: (m.alarms ?? []).map((alarm) => ({
              alarmTime: new Date(alarm),
            })),
          },
        })),
      };
    }

    return input;
  },
};
