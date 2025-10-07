import { z } from 'zod';

// Zod 스키마 정의 (Validator 역할)
export const createCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().length(6, { message: '인증 코드는 6자리여야 합니다.' }),
});

// GET /companies 쿼리 파라미터 스키마
export const getCompaniesSchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
  searchBy: z.literal('companyName').optional(),
  keyword: z.string().optional(),
});

// GET /companies/users 쿼리 파라미터 스키마
export const getUsersByCompanySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  searchBy: z.enum(['companyName', 'name', 'email']).optional(),
  keyword: z.string().optional(),
});

export const companyIdParamsSchema = z.object({
  companyId: z.number().int().positive(),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().length(6, { message: '인증 코드는 6자리여야 합니다.' }),
});

// 스키마에서 타입 추론 (DTO 역할)
export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type GetCompaniesDto = z.infer<typeof getCompaniesSchema>;
export type CompanyIdParamsDto = z.infer<typeof companyIdParamsSchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type GetUsersByCompanyDto = z.infer<typeof getUsersByCompanySchema>;

// API 응답을 위한 DTO
export type CompanyResponseDto = {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
};

// 회사별 유저 조회 응답 DTO
export type UserWithCompanyResponseDto = {
  id: number;
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  company: {
    companyName: string;
  };
};
