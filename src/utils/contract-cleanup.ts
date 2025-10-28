import contractDocumentRepository from '../repositories/contract-document-repository.js';
import { deletePhysicalFile } from './file-delete.js';

/** 계약 ID 목록에 해당하는 모든 계약서 문서 파일을 물리적으로 삭제 */
export async function cleanupContractDocuments(contractIds: number[]): Promise<void> {
  if (contractIds.length === 0) return;

  const documents = await contractDocumentRepository.findByContractIds(contractIds);

  for (const doc of documents) {
    await deletePhysicalFile(doc.filePath, 'raw');
  }
}
