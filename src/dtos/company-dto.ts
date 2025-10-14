import { z } from 'zod';

// POST /companies: 회사 등록 요청 DTO 스키마
export const createCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().min(1, { message: '기업 인증 코드는 필수입니다.' }),
});

// GET /companies: 회사 목록 조회 쿼리 DTO 스키마
export const getCompaniesSchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
  searchBy: z.enum(['companyName', 'companyCode']).optional(),
  keyword: z.string().optional(),
});

// GET /companies/users 쿼리 파라미터 스키마

export const getUsersByCompanySchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),  
  searchBy: z.enum(['companyName', 'name', 'email']).optional(),
  keyword: z.string().optional(),
});


// URL Path Params: 회사 ID 파라미터 DTO 스키마
export const companyIdParamsSchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

// PATCH /companies/:companyId: 회사 정보 수정 요청 DTO 스키마
export const updateCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().min(1, { message: '기업 인증 코드는 필수입니다.' }),
});

// --- Zod 스키마에서 타입 추론 (DTO 정의) ---
export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type GetCompaniesDto = z.infer<typeof getCompaniesSchema>;
export type CompanyIdParamsDto = z.infer<typeof companyIdParamsSchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type GetUsersByCompanyDto = z.infer<typeof getUsersByCompanySchema>;

// --- API 응답 DTO ---

// 회사 목록 응답 DTO
export type CompanyResponseDto = {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
};

// 회사별 유저 목록 응답 DTO
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