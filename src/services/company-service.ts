import {
  CreateCompanyDto,
  GetCompaniesDto,
  CompanyResponseDto,
  UpdateCompanyDto,
  GetUsersByCompanyDto,
  UserWithCompanyResponseDto,
} from '../dtos/company-dto.js';
import companyRepository from '../repositories/company-repository.js';

const companyService = {
  // 회사 등록
  async create(companyData: CreateCompanyDto) {
    const newCompany = await companyRepository.create(companyData);
    return newCompany;
  },

  // 회사 목록 조회
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

  // 회사별 유저 조회
  async getUsersByCompany(query: GetUsersByCompanyDto) {
    const { users, total } = await companyRepository.getUsersByCompany(query);

    const { page = 1, pageSize = 10 } = query;

    const mappedData: UserWithCompanyResponseDto[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber,
      company: {
        companyName: user.company.name,
      },
    }));
    const totalPages = Math.ceil(total / pageSize);

    return {
      currentPage: page,
      totalPages,
      totalItemCount: total,
      data: mappedData,
    };
  },

  // 회사 수정
  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await companyRepository.update(companyId, companyData);
    return updatedCompany;
  },

  // 회사 삭제
  async delete(companyId: number) {
    await companyRepository.delete(companyId);
  },
};

export default companyService;
