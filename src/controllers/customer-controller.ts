import { Request, Response } from "express";
import { CustomerService } from "../services/customer-service.js";

const customerService = new CustomerService();

export class CustomerController {
  // 고객 등록
  async create(req: Request, res: Response) {
    try {
      //req.user 존재 확인
      if (!req.user) {
        return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
      }

      const companyId = req.user.companyId;
      const customer = await customerService.createCustomer(companyId, req.body);
      return res.status(201).json(customer);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

 // 고객 목록 조회 (검색 + 페이지네이션)
async list(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
    }

    const companyId = req.user.companyId;

    // 프론트엔드 요청에 맞게 변수명 수정
    const { page, pageSize, searchBy, keyword } = req.query;

    const result = await customerService.getCustomers(
      companyId,
      String(searchBy || "name"), // 검색 기준
      String(keyword || ""),      // 검색어
      Number(page) || 1,          // 페이지 번호
      Number(pageSize) || 10      // 페이지당 데이터 수
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}


  // 고객 상세 조회
  async detail(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
      }

      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      const customer = await customerService.getCustomerById(companyId, customerId);
      return res.status(200).json(customer);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  // 고객 수정
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
      }

      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      const updated = await customerService.updateCustomer(companyId, customerId, req.body);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 고객 삭제
  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
      }

      const companyId = req.user.companyId;
      const customerId = Number(req.params.customerId);

      await customerService.deleteCustomer(companyId, customerId);
      return res.status(200).json({ message: "고객이 삭제되었습니다." });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 고객 데이터 대용량 업로드
  async bulkUpload(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "인증된 사용자가 아닙니다." });
      }

      const companyId = req.user.companyId;
      const filePath = req.file?.path;

      if (!filePath) {
        return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
      }

      const result = await customerService.bulkUpload(companyId, filePath);
      return res.status(200).json({ message: "고객 데이터 업로드 완료", ...result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
