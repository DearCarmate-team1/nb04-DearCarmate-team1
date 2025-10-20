import { z } from 'zod';

/** 🔧 차량 검증 규칙 상수 */
const CAR_VALIDATION = {
  YEAR_MIN: 1900,
  YEAR_MAX: () => new Date().getFullYear() + 1,
  MILEAGE_MAX: 1000000,
  PRICE_MAX: 1000000000,
  ACCIDENT_COUNT_MAX: 100,
} as const;

/** 🚗 차량 상태 Enum (Zod 기반) */
export const carStatusSchema = z.enum(['possession', 'contractProceeding', 'contractCompleted']);
export type CarStatus = z.infer<typeof carStatusSchema>;

// 🚗 차량 등록 DTO
export const createCarSchema = z.object({
  carNumber: z.string().min(1, { message: '차량 번호는 필수입니다.' }),
  manufacturer: z.string().min(1, { message: '제조사는 필수입니다.' }),
  model: z.string().min(1, { message: '차종은 필수입니다.' }),
  manufacturingYear: z
    .number()
    .int()
    .gte(CAR_VALIDATION.YEAR_MIN, {
      message: `제조연도는 ${CAR_VALIDATION.YEAR_MIN}년 이상이어야 합니다.`,
    })
    .lte(CAR_VALIDATION.YEAR_MAX(), { message: '제조연도가 너무 미래입니다.' }),
  mileage: z
    .number()
    .int()
    .nonnegative({ message: '주행거리는 0 이상이어야 합니다.' })
    .lte(CAR_VALIDATION.MILEAGE_MAX, {
      message: `주행거리는 ${CAR_VALIDATION.MILEAGE_MAX.toLocaleString()}km 이하여야 합니다.`,
    }),
  price: z
    .number()
    .int()
    .nonnegative({ message: '가격은 0 이상이어야 합니다.' })
    .lte(CAR_VALIDATION.PRICE_MAX, { message: '가격은 10억원 이하여야 합니다.' }),
  accidentCount: z
    .number()
    .int()
    .nonnegative({ message: '사고횟수는 0 이상이어야 합니다.' })
    .lte(CAR_VALIDATION.ACCIDENT_COUNT_MAX, {
      message: `사고횟수는 ${CAR_VALIDATION.ACCIDENT_COUNT_MAX}회 이하여야 합니다.`,
    }),
  explanation: z.string().optional(),
  accidentDetails: z.string().optional(),
});

// 🚙 차량 수정 DTO (createCarSchema 기반 + status 추가)
export const updateCarSchema = createCarSchema.partial().extend({
  status: carStatusSchema.optional(),
});

// 🔍 차량 조회 DTO (쿼리 기반)
export const carQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
    status: carStatusSchema.or(z.literal('total')).optional(),
    searchBy: z.enum(['carNumber', 'model']).optional(),
    keyword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // searchBy와 keyword는 함께 사용되어야 함
    const hasSearchBy = data.searchBy !== undefined;
    const hasKeyword = data.keyword !== undefined;

    if (hasSearchBy && !hasKeyword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'searchBy를 사용하려면 keyword가 필요합니다.',
        path: ['keyword'],
      });
    }

    if (hasKeyword && !hasSearchBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'keyword를 사용하려면 searchBy가 필요합니다.',
        path: ['searchBy'],
      });
    }
  });

// 🔑 params용 (자동 숫자 변환)
export const carIdParamSchema = z.object({
  carId: z.coerce.number().int().positive({ message: '유효한 차량 ID가 아닙니다.' }),
});

// 🧩 타입 추론 (DTO 역할)
export type CreateCarDto = z.infer<typeof createCarSchema>;
export type UpdateCarDto = z.infer<typeof updateCarSchema>;
export type CarQueryDto = z.infer<typeof carQuerySchema>;
