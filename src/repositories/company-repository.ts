import prisma from '../configs/prisma-client.js';
import type { Prisma } from '@prisma/client';
import type {
  CreateCompanyDto,
  GetCompaniesDto,
  UpdateCompanyDto,
  GetUsersByCompanyDto,
} from '../dtos/company-dto.js';
import type { PrismaTransactionClient } from '../types/prisma.js';

const companyRepository = {
  // 회사 등록
  async create(companyData: CreateCompanyDto) {
    const createdCompany = await prisma.company.create({
      data: {
        name: companyData.companyName,
        authCode: companyData.companyCode,
      },
      include: { _count: { select: { User: true } } },
    });
    return {
      id: createdCompany.id,
      companyName: createdCompany.name,
      companyCode: createdCompany.authCode,
      userCount: createdCompany._count.User,
    };
  },

  // 회사 목록 조회
  async getAll(query: GetCompaniesDto, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    const { page = 1, pageSize = 10, searchBy, keyword } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 검색 조건 (where) 설정
    const where: Prisma.CompanyWhereInput = {};
    if ( searchBy === 'companyName' && keyword) {
      where.name = { contains: keyword, mode: 'insensitive' };
    } else if (searchBy === 'companyCode' && keyword) {
      where.authCode = { contains: keyword, mode: 'insensitive' };
    }
      // 실제 데이터 목록 조회
      const companies = await db.company.findMany({
        where,
        skip,
        take,
        include: { _count: { select: { User: true } } },
        orderBy: { createdAt: 'desc' },
      });
      // 전체 데이터 개수 조회
      const total = await db.company.count({ where });
  
      return { companies, total };
  },

  // 회사별 유저 조회
  async getUsersByCompany(query: GetUsersByCompanyDto, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    const { page = 1, pageSize = 10, searchBy, keyword } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 검색 조건 (where) 설정
    let where: Prisma.UserWhereInput = {};
    if (searchBy && keyword) {
      if (searchBy === 'name') {
        where = { name: { contains: keyword, mode: 'insensitive' } };
      } else if (searchBy === 'email') {
        where = { email: { contains: keyword, mode: 'insensitive' } };
      } else if (searchBy === 'companyName') {
        where = { company: { name: { contains: keyword, mode: 'insensitive' } } };
      }
    }

    // 실제 데이터 목록 조회
    const users = await db.user.findMany({
        where,
        skip,
        take,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
      // 전체 데이터 개수 조회
      const total = await db.user.count({ where });

      return { users, total };
  },

  // 회사 수정
  async update(companyId: number, companyData: UpdateCompanyDto) {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: companyData.companyName,
        authCode: companyData.companyCode,
      },
      include: { _count: { select: { User: true } } },
    });
    return {
      id: updatedCompany.id,
      companyName: updatedCompany.name,
      companyCode: updatedCompany.authCode,
      userCount: updatedCompany._count.User,
    };
  },

  // 회사 삭제
  async delete(companyId: number) {
    await prisma.company.delete({ where: { id: companyId } });
  },
<<<<<<< HEAD
=======

  // 유저 회원가입 시, 회사명과 인증코드를 검증하기 위해 추가
  async findByNameAndAuthCode(name: string, authCode: string) {
    return prisma.company.findFirst({
      where: {
        AND: [{ name }, { authCode }],
      },
    });
  },

  async update() {},
  async delete() {},
  async getAll() {},
  async getById() {},
>>>>>>> ccd47ad (feat: 유저 CRUD API 유효성검사 제외)
};

export default companyRepository;
