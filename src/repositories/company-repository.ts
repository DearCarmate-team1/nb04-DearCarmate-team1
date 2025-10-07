import prisma from '../configs/prisma-client.js';
import type { Prisma } from '@prisma/client';
import type {
  CreateCompanyDto,
  GetCompaniesDto,
  UpdateCompanyDto,
  GetUsersByCompanyDto,
} from '../dtos/company-dto.js';

const companyRepository = {
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

  async getAll(query: GetCompaniesDto) {
    const { page = 1, pageSize = 10, searchBy, keyword } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 검색 조건 (where) 설정
    const where: Prisma.CompanyWhereInput =
      searchBy === 'companyName' && keyword
        ? {
            name: { contains: keyword, mode: 'insensitive' },
          }
        : {};

    // 트랜잭션 사용하여 데이터와 총 개수 동시 조회
    const [companies, total] = await prisma.$transaction([
      // 실제 데이터 목록 조회
      prisma.company.findMany({
        where,
        skip,
        take,
        include: { _count: { select: { User: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      // 전체 데이터 개수 조회
      prisma.company.count({ where }),
    ]);
    return { companies, total };
  },

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

  async delete(companyId: number) {
    await prisma.company.delete({ where: { id: companyId } });
  },

  async getUsersByCompany(query: GetUsersByCompanyDto) {
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

    // 트랜잭션 사용하여 데이터와 총 개수 동시 조회
    const [users, total] = await prisma.$transaction([
      // 실제 데이터 목록 조회
      prisma.user.findMany({
        where,
        skip,
        take,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      }),
      // 전체 데이터 개수 조회
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },
};

export default companyRepository;
