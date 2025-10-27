import { Request, Response } from 'express';
import { CustomerService } from '../services/customer-service.js';

const customerService = new CustomerService();

export class CustomerController {
  // 고객 등록
  async create(req: Request, res: Response) {
    try {
      // authenticate 미들웨어에서 req.user 보장
      const companyId = req.user.companyId;
      const customer = await customerService.createCustomer(companyId, req.body);
      return res.status(201).json(customer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return res.status(400).json({ message });
    }
  }

  // 고객 목록 조회 (검색 + 페이지네이션)
  async list(req: Request, res: Response) {
    try {
      // authenticate 미들웨어에서 req.user 보장
      const companyId = req.user.companyId;

      // 프론트엔드 요청에 맞게 변수명 수정
      const { page, pageSize, searchBy, keyword } = req.query;

      const result = await customerService.getCustomers(
        companyId,
        String(searchBy || 'name'), // 검색 기준
        String(keyword || ''), // 검색어
        Number(page) || 1, // 페이지 번호
        Number(pageSize) || 10, // 페이지당 데이터 수
      );

      return res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return res.status(400).json({ message });
    }
  }

  // 고객 상세 조회
  async detail(req: Request, res: Response) {
    try {
      // authenticate 미들웨어에서 req.user 보장
      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      const customer = await customerService.getCustomerById(companyId, customerId);
      return res.status(200).json(customer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return res.status(404).json({ message });
    }
  }

  // 고객 수정
  async update(req: Request, res: Response) {
    try {
      // authenticate 미들웨어에서 req.user 보장
      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      const updated = await customerService.updateCustomer(companyId, customerId, req.body);
      return res.status(200).json(updated);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return res.status(400).json({ message });
    }
  }

  // 고객 삭제
  async delete(req: Request, res: Response) {
    try {
      // authenticate 미들웨어에서 req.user 보장
      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      await customerService.deleteCustomer(companyId, customerId);
      return res.status(200).json({ message: '고객이 삭제되었습니다.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return res.status(400).json({ message });
    }
  }

  /** 📤 고객 CSV 대용량 업로드 (메모리 기반 - 디스크 저장 안 함) */
  async bulkUpload(req: Request, res: Response): Promise<void> {
    const result = await customerService.bulkUpload(req.user, req.file);

    // ✅ 실패 내역이 있으면 207 Multi-Status 반환
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
  }
}
