import prisma from '../configs/prisma-client.js';

const companyRepository = {
  async create(companyData) {
    return prisma.companie.create({
      data: {
        companyData,
      },
    });
  },
  async update() {},
  async delete() {},
  async getAll() {},
  async getById() {},
};

export default companyRepository;
