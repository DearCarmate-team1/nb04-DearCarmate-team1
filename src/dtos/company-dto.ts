import { z } from 'zod';

export const createCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().min(1, { message: '기업 인증 코드는 필수입니다.' }),
});

export const getCompaniesSchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
  searchBy: z.enum(['companyName', 'companyCode']).optional(),
  keyword: z.string().optional(),
});

export const getUsersByCompanySchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
  searchBy: z.enum(['companyName', 'name', 'email']).optional(),
  keyword: z.string().optional(),
});

export const companyIdParamsSchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(1, { message: '회사 이름은 필수입니다.' }),
  companyCode: z.string().min(1, { message: '기업 인증 코드는 필수입니다.' }),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type GetCompaniesDto = z.infer<typeof getCompaniesSchema>;
export type CompanyIdParamsDto = z.infer<typeof companyIdParamsSchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type GetUsersByCompanyDto = z.infer<typeof getUsersByCompanySchema>;

export type CompanyResponseDto = {
  id: number;
  companyName: string;
  companyCode: string;
  userCount: number;
};

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