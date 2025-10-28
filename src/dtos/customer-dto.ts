import { z } from 'zod';

export const genderSchema = z.enum(['male', 'female'], {
  message: '유효한 성별을 선택하세요.',
});

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

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerIdParamSchema = z.object({
  customerId: z.coerce.number().int().positive({ message: '유효한 고객 ID가 아닙니다.' }),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

export type CreateCustomerDTO = CreateCustomerDto;
export type UpdateCustomerDTO = UpdateCustomerDto;
