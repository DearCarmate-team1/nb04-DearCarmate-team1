import { Request, Response } from 'express';
import customerService from '../services/customer-service.js';

const customerController = {
  /** 고객 등록 */
  async create(req: Request, res: Response): Promise<void> {
    const companyId = req.user.companyId;
    const customer = await customerService.createCustomer(companyId, req.body);
    res.status(201).json(customer);
  },

  /** 고객 목록 조회 (검색 + 페이지네이션) */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = req.user.companyId;
    const { page, pageSize, searchBy, keyword } = req.query;

    const result = await customerService.getCustomers(
      companyId,
      String(searchBy || 'name'),
      String(keyword || ''),
      Number(page) || 1,
      Number(pageSize) || 10,
    );

    res.status(200).json(result);
  },

  /** 고객 상세 조회 */
  async detail(req: Request, res: Response): Promise<void> {
    const companyId = req.user.companyId;
    const customerId = Number(req.params.customerId);

    const customer = await customerService.getCustomerById(companyId, customerId);
    res.status(200).json(customer);
  },

  /** 고객 수정 */
  async update(req: Request, res: Response): Promise<void> {
    const companyId = req.user.companyId;
    const customerId = Number(req.params.customerId);

    const updated = await customerService.updateCustomer(companyId, customerId, req.body);
    res.status(200).json(updated);
  },

  /** 고객 삭제 */
  async delete(req: Request, res: Response): Promise<void> {
    const companyId = req.user.companyId;
    const customerId = Number(req.params.customerId);

    await customerService.deleteCustomer(companyId, customerId);
    res.status(200).json({ message: '고객이 삭제되었습니다.' });
  },

  /** 고객 CSV 대용량 업로드 (메모리 기반 - 디스크 저장 안 함) */
  async bulkUpload(req: Request, res: Response): Promise<void> {
    const result = await customerService.bulkUpload(req.user, req.file);

    // 실패 내역이 있으면 207 Multi-Status 반환
    if (result.failureCount > 0) {
      res.status(207).json({
        message: `${result.successCount}명 등록 성공, ${result.failureCount}명 실패`,
        successCount: result.successCount,
        failureCount: result.failureCount,
        failures: result.failures,
      });
    } else {
      res.status(200).json({
        message: `성공적으로 ${result.successCount}명 등록되었습니다.`,
        successCount: result.successCount,
      });
    }
  },
};

export default customerController;
