import fs from 'fs';
import { parse } from 'csv-parse';
import { prisma } from '../prismaClient';


export const importCustomersFromCsv = async (filePath: string, companyId: number) => {
const stream = fs.createReadStream(filePath);
const parser = stream.pipe(
parse({ columns: true, skip_empty_lines: true, trim: true })
);


const created: any[] = [];
for await (const record of parser) {
// CSV 컬럼 예: name, gender, phone, ageGroup, region, email, memo
try {
const c = await prisma.customer.create({
data: {
name: record.name,
gender: record.gender ?? 'U',
phone: record.phone,
ageGroup: record.ageGroup || null,
region: record.region || null,
email: record.email || null,
memo: record.memo || null,
companyId,
},
});
created.push(c);
} catch (err) {
// 중복 등 오류 시 무시하고 계속 진행
}
}


// 로컬 파일 삭제 (multer 의 dest 사용 시)
try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }


return created;
};