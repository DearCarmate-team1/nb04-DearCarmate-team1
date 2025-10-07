import type { Request, Response } from 'express';
import companyServie from '../services/company-service.js';

const companyController = {
  async create(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const companyData = req.body;
    const newCompany = await companyServie.create(companyData);
    res.status(201).json(newCompany);
  },

  async getAll(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const query = req.query;
    const companies = await companyServie.getAll(query);
    res.status(200).json(companies);
  },
  async update() {},
  async delete() {},
  async getById() {}, // 참조하는 변수에 따라
};

export default companyController;
