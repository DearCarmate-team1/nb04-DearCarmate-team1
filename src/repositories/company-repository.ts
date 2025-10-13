import prisma from '../configs/prisma-client.js';
import type { CreateCompanyDto } from '../dtos/company-dto.js';

const companyRepository = {
  async create(companyData: CreateCompanyDto) {
    return prisma.company.create({
      data: companyData,
    });
  },

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
};

export default companyRepository;
