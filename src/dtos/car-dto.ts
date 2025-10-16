import { z } from 'zod';

// 🚗 차량 등록 DTO
export const createCarSchema = z.object({
  carNumber: z.string().min(1, { message: '차량 번호는 필수입니다.' }),
  manufacturer: z.string().min(1, { message: '제조사는 필수입니다.' }),
  model: z.string().min(1, { message: '차종은 필수입니다.' }),
  manufacturingYear: z.number().int().gte(1900, { message: '올바른 제조연도를 입력해주세요.' }),
  mileage: z.number().int().nonnegative({ message: '주행거리를 올바르게 입력해주세요.' }),
  price: z.number().int().nonnegative({ message: '가격을 올바르게 입력해주세요.' }),
  accidentCount: z.number().int().nonnegative({ message: '사고횟수를 올바르게 입력해주세요.' }),
  explanation: z.string().optional(),
  accidentDetails: z.string().optional(),
});

// 🚙 차량 수정 DTO
export const updateCarSchema = z.object({
  carNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  manufacturingYear: z.number().optional(),
  mileage: z.number().optional(),
  price: z.number().optional(),
  accidentCount: z.number().optional(),
  explanation: z.string().optional(),
  accidentDetails: z.string().optional(),
  status: z.enum(['possession', 'contractProceeding', 'contractCompleted']).optional(),
});

// 🔍 차량 조회 DTO (쿼리 기반)
export const carQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  status: z.enum(['possession', 'contractProceeding', 'contractCompleted', 'total']).optional(),
  searchBy: z.enum(['carNumber', 'model']).optional(),
  keyword: z.string().optional(),
});

// 🔑 params용 (자동 숫자 변환)
export const carIdParamSchema = z.object({
  carId: z.coerce.number().int().positive({ message: '유효한 차량 ID가 아닙니다.' }),
});

// 🧩 타입 추론 (DTO 역할)
export type CreateCarDto = z.infer<typeof createCarSchema>;
export type UpdateCarDto = z.infer<typeof updateCarSchema>;
