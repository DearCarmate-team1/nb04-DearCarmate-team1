import { CreateCompanyDto } from '../dtos/company-dto.js';
const companyServie = {
  async create(companyData: CreateCompanyDto) {
    const newCompany = await companyRepository.create(companyData);
    return newCompany;
  },

  async update() {},
  async delete() {},
  async getAll() {},
  async getById() {},
};

export default companyServie;
