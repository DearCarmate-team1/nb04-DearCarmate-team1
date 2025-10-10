import { z } from 'zod';

// Zod 스키마 정의 (Validator 역할)
export const createCompanySchema = z.object({
  name: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  authCode: z.string().length(6, { message: '인증 코드는 6자리여야 합니다.' }),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  authCode: z.string().length(6, { message: '인증 코드는 6자리여야 합니다.' }),
});

// 스키마에서 타입 추론 (DTO 역할)
export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
