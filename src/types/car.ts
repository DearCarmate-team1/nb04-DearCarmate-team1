/** -------------------------------------------------
 * 🚗 Car Domain Types
 * - Domain 중심 타입 정의 (Prisma 비의존)
 * ------------------------------------------------- */

/** 🚗 차량 상태 ENUM */
export type CarStatus = 'possession' | 'contractProceeding' | 'contractCompleted';

/** -------------------------------------------------
 * 🧩 Domain Entity (DB 조회 결과 / 내부 로직)
 * ------------------------------------------------- */

/** 🚗 차량 엔티티 */
export interface CarEntity {
  id: number;
  carNumber: string;
  manufacturer: string;
  model: string;
  type: string;
  manufacturingYear: number;
  mileage: number;
  price: number;
  accidentCount: number;
  explanation?: string;
  accidentDetails?: string;
  status: CarStatus;
  companyId: number;
  modelId: number;
  createdAt: Date;
  updatedAt: Date;
}

/** 🏭 차량 모델 엔티티 */
export interface CarModelEntity {
  id: number;
  manufacturer: string;
  model: string;
  type: string;
}

/** 🏭 Flat 형태 제조사/모델 */
export interface CarModelFlat {
  manufacturer: string;
  model: string;
}

/** 🚙 CSV 업로드용 Row 타입 */
export interface CarCsvRow {
  carNumber: string;
  manufacturer: string;
  model: string;
  manufacturingYear: string;
  mileage: string;
  price: string;
  accidentCount: string;
  explanation?: string;
  accidentDetails?: string;
}

/** -------------------------------------------------
 * ✏️ Command Input (Service → Repository 입력)
 * ------------------------------------------------- */

/** 🚗 차량 생성 입력 타입 */
export interface CarCreateInput {
  carNumber: string;
  manufacturingYear: number;
  mileage: number;
  price: number;
  accidentCount: number;
  explanation?: string;
  accidentDetails?: string;
  companyId: number;
  modelId: number;
  status?: CarStatus;
}

/** 🚙 차량 수정 입력 타입 */
export interface CarUpdateInput {
  carNumber?: string;
  manufacturingYear?: number;
  mileage?: number;
  price?: number;
  accidentCount?: number;
  explanation?: string;
  accidentDetails?: string;
  status?: CarStatus;
  modelId?: number;
}

/** -------------------------------------------------
 * 📤 Response Models (Controller → Client)
 * ------------------------------------------------- */

/** 🚗 단일 차량 응답 모델 */
export interface CarResponseModel {
  id: number;
  carNumber: string;
  manufacturer: string;
  model: string;
  type: string;
  manufacturingYear: number;
  mileage: number;
  price: number;
  accidentCount: number;
  explanation: string;
  accidentDetails: string;
  status: CarStatus;
}

/** 📋 차량 목록 응답용 */
export interface CarListResponse {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  data: CarResponseModel[];
}
