import {
  CreateCompanyDto,
  GetCompaniesDto,
  CompanyResponseDto,
  UpdateCompanyDto,
} from '../dtos/company-dto.js';
import companyRepository from '../repositories/company-repository.js';

const companyService = {
  async create(companyData: CreateCompanyDto) {
    const newCompany = await companyRepository.create(companyData);
    return newCompany;
  },

  async getAll(query: GetCompaniesDto) {
    const { page = 1, pageSize = 10 } = query;

    const { companies, total } = await companyRepository.getAll(query);

    // API 명세에 맞게 데이터 가공
    const mappedData: CompanyResponseDto[] = companies.map((company) => ({
      id: company.id,
      companyName: company.name,
      companyCode: company.authCode,
      userCount: company._count.User,
    }));

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(total / pageSize);

    return {
      currentPage: page,
      totalPages,
      totalItemCount: total,
      data: mappedData,
    };
  },

  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await companyRepository.update(companyId, companyData);
    return updatedCompany;
  },

  async delete(companyId: number) {
    await companyRepository.delete(companyId);
  },

  async getById() {},
};

export default companyService;
