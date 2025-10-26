import { z } from 'zod';

// 성별 enum
export const genderSchema = z.enum(['남성', '여성', '기타'], {
  message: '유효한 성별을 선택하세요.',
});

// 생성 스키마
export const createCustomerSchema = z.object({
  name: z.string().min(1, { message: '이름은 필수입니다.' }),
  gender: genderSchema,
  phoneNumber: z.string().regex(/^010-\d{4}-\d{4}$/, {
    message: '전화번호는 010-XXXX-XXXX 형식이어야 합니다.',
  }),
  ageGroup: z.string().optional(),
  region: z.string().optional(),
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다.' }).optional(),
  memo: z.string().optional(),
});

// 수정 스키마
export const updateCustomerSchema = createCustomerSchema.partial();

// params 스키마
export const customerIdParamSchema = z.object({
  customerId: z.coerce.number().int().positive({ message: '유효한 고객 ID가 아닙니다.' }),
});

// 타입 추론
export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

// 하위 호환성을 위한 타입 별칭 (기존 코드에서 DTO 대문자 사용)
export type CreateCustomerDTO = CreateCustomerDto;
export type UpdateCustomerDTO = UpdateCustomerDto;
