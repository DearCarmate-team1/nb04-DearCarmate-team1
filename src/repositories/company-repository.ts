import prisma from '../configs/prisma-client.js';
import type { CreateCompanyDto } from '../dtos/company-dto.js';

const companyRepository = {
  async create(companyData: CreateCompanyDto) {
    return prisma.company.create({
      data: companyData,
    });
  },
  async update() {},
  async delete() {},
  async getAll() {},
  async getById() {},
};

export default companyRepository;
