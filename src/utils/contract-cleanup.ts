import contractDocumentRepository from '../repositories/contract-document-repository.js';
import { deletePhysicalFile } from './file-delete.js';

/**
 * 계약 ID 목록에 해당하는 모든 계약서 문서 파일을 물리적으로 삭제합니다.
 * @param contractIds 삭제할 계약 ID 배열
 */
export async function cleanupContractDocuments(contractIds: number[]): Promise<void> {
  if (contractIds.length === 0) return;

  const documents = await contractDocumentRepository.findByContractIds(contractIds);

  for (const doc of documents) {
    await deletePhysicalFile(doc.filePath, 'raw');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`계약 문서 파일 ${documents.length}개 정리 완료`);
  }
}
