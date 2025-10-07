import prisma from '../configs/prisma-client.js';
import type { Prisma } from '@prisma/client';
import type { CreateCompanyDto, GetCompaniesDto } from '../dtos/company-dto.js';

const companyRepository = {
  async create(companyData: CreateCompanyDto) {
    return prisma.company.create({
      data: companyData,
    });
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

  async update() {},
  async delete() {},
  async getById() {},
};

export default companyRepository;
