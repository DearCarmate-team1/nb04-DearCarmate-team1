import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(1, '이름은 필수입니다.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    employeeNumber: z.string().min(1, '사원번호는 필수입니다.'),
    phoneNumber: z.string().min(1, '전화번호는 필수입니다.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirmation: z.string(),
    company: z.string().min(1, '회사 이름은 필수입니다.'),
    companyCode: z.string().length(6, '회사 코드는 6자리여야 합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
    path: ['passwordConfirmation'], // 오류가 발생할 필드 지정
  });

export const updateUserSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호는 필수입니다.'),
    employeeNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').optional(),
    passwordConfirmation: z.string().optional(),
    imageUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
    path: ['passwordConfirmation'],
  });

// 스키마에서 타입 추론 (DTO 역할)
export type CreateUserDto = z.infer<typeof createUserSchema>;

export interface UpdateUserDto {
  currentPassword?: string;
  employeeNumber?: string;
  phoneNumber?: string;
  password?: string;
  passwordConfirmation?: string;
  imageUrl?: string;
}
