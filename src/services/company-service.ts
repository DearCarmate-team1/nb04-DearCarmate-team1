import {
  CreateCompanyDto,
  GetCompaniesDto,
  CompanyResponseDto,
  UpdateCompanyDto,
  GetUsersByCompanyDto,
  UserWithCompanyResponseDto,
} from '../dtos/company-dto.js';
import companyRepository from '../repositories/company-repository.js';
import prisma from '../configs/prisma-client.js';
import { ConflictError } from '../configs/custom-error.js';

const companyService = {
  // 회사 등록
  async create(companyData: CreateCompanyDto) {

    // 회사 이름 중복 확인
    const existingByName = await companyRepository.findByName(companyData.companyName);
    if (existingByName) {
      throw new ConflictError('이미 사용 중인 회사 이름입니다.');
    }

    // 회사 코드 중복 확인
    const existingByCode = await companyRepository.findByAuthCode(companyData.companyCode);
    if (existingByCode) {
      throw new ConflictError('이미 사용 중인 회사 코드입니다.');
    }

    // 회사 생성
    const newCompany = await companyRepository.create(companyData);
    const responseDto : CompanyResponseDto = {
      id: newCompany.id,
      companyName: newCompany.name,
      companyCode: newCompany.authCode,
      userCount: newCompany._count.User,
    } 
    return responseDto;
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
  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await companyRepository.update(companyId, companyData);
    const responseDto: CompanyResponseDto = {
      id: updatedCompany.id,
      companyName: updatedCompany.name,
      companyCode: updatedCompany.authCode,
      userCount: updatedCompany._count.User,
    }
    return responseDto;
  },

  // 회사 삭제
  async delete(companyId: number) {
    await companyRepository.delete(companyId);
  },

};

export default companyService;