import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호는 필수입니다.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token은 필수입니다.'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
