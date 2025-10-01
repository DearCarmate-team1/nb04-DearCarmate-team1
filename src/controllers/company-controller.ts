import type { Request, Response } from 'express';
import companyServie from '../services/company-service.js';

const companyController = {
  async create(req: Request, res: Response) {
    // req.user 없는 경우 에러 처리
    const companyData = req.body;
    const newCompany = await companyServie.create(companyData);
    res.status(201).json(newCompany);
  },

  async update() {},
  async delete() {},
  async getAll() {},
  async getById() {}, // 참조하는 변수에 따라
};

export default companyController;
