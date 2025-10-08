import type { Request, Response } from 'express';
import companyServie from '../services/company-service.js';

const companyController = {
  // 회사 등록
  async create(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: '관리자 권한이 필요합니다' });
      return;
    }
    const companyData = req.body;
    const newCompany = await companyServie.create(companyData);
    res.status(201).json(newCompany);
  },

  // 회사 목록 조회
  async getAll(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: '관리자 권한이 필요합니다' });
      return;
    }
    const query = req.query;
    const companies = await companyServie.getAll(query);
    res.status(200).json(companies);
  },

  // 회사별 유저 조회
  async getUsersByCompany(req: Request, res: Response) {
    const query = req.query;
    const result = await companyServie.getUsersByCompany(query);
    res.status(200).json(result);
  },

  // 회사 수정
  async update(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: '관리자 권한이 필요합니다' });
      return;
    }

    const { companyId } = req.params;
    const companyData = req.body;

    const updatedCompany = await companyServie.update(Number(companyId), companyData);
    res.status(200).json(updatedCompany);
  },

  // 회사 삭제
  async delete(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ message: '관리자 권한이 필요합니다' });
      return;
    }
    const { companyId } = req.params;
    await companyServie.delete(Number(companyId));
    res.status(200).json({ message: '회사 삭제 성공' });
  },
};

export default companyController;
