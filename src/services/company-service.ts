import {
  CreateCompanyDto,
  GetCompaniesDto,
  CompanyResponseDto,
  UpdateCompanyDto,
<<<<<<< HEAD
<<<<<<< HEAD
  GetUsersByCompanyDto,
  UserWithCompanyResponseDto,
=======
>>>>>>> 41c683e (feat: 회사 수정 및 삭제 구현)
=======
  GetUsersByCompanyDto,
  UserWithCompanyResponseDto,
>>>>>>> 8deac88 (feat: 회사별 유저 조회 기능 구현)
} from '../dtos/company-dto.js';
import companyRepository from '../repositories/company-repository.js';
import prisma from '../configs/prisma-client.js';

const companyService = {
  // 회사 등록
  async create(companyData: CreateCompanyDto) {
    const newCompany = await companyRepository.create(companyData);
    return newCompany;
  },

  // 회사 목록 조회
  async getAll(query: GetCompaniesDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const numericQuery = { ...query, page, pageSize };

    const { companies, total } = await prisma.$transaction(async (tx) => {
      return companyRepository.getAll(numericQuery, tx);
    });

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

<<<<<<< HEAD
<<<<<<< HEAD
  // 회사별 유저 조회
  async getUsersByCompany(query: GetUsersByCompanyDto) {

    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const numericQuery = { ...query, page, pageSize };

    const { users, total } = await prisma.$transaction(async (tx) => {
      return companyRepository.getUsersByCompany(numericQuery, tx);
    });

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
=======
>>>>>>> 41c683e (feat: 회사 수정 및 삭제 구현)
  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await companyRepository.update(companyId, companyData);
    return updatedCompany;
  },

<<<<<<< HEAD
  // 회사 삭제
=======
>>>>>>> 41c683e (feat: 회사 수정 및 삭제 구현)
  async delete(companyId: number) {
    await companyRepository.delete(companyId);
  },

<<<<<<< HEAD
=======
=======
  // 회사별 유저 조회
>>>>>>> 3cd660d (refactor: 회사 관련 주석 추가)
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
<<<<<<< HEAD
>>>>>>> 8deac88 (feat: 회사별 유저 조회 기능 구현)
=======

  // 회사 수정
  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await companyRepository.update(companyId, companyData);
    return updatedCompany;
  },

  // 회사 삭제
  async delete(companyId: number) {
    await companyRepository.delete(companyId);
  },
>>>>>>> 3cd660d (refactor: 회사 관련 주석 추가)
};

export default companyService;