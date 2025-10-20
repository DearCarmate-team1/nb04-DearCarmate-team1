import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 DearCarmate Seeding Started (auto mode)\n');

  const seedsDir = path.join(__dirname, 'seeds');

  // 1️⃣ seeds 폴더 내 .ts 파일 자동 탐색
  const seedFiles = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith('.seed.ts') || file.endsWith('.seed.js'));

  console.log(`📂 감지된 시드 파일: ${seedFiles.join(', ')}`);

  // 2️⃣ 정렬 기준 (보통 파일명 알파벳 순)
  seedFiles.sort();

  // 3️⃣ 각 시드 파일을 동적으로 import 후 실행
  for (const file of seedFiles) {
    const filePath = path.join(seedsDir, file);
    const module = await import(filePath);

    // export된 함수 중 'seed' 또는 'main' 이름을 가진 함수 찾기
    const seedFn = module.seed || module.main || Object.values(module)[0];
    if (typeof seedFn === 'function') {
      console.log(`\n🌱 실행 중: ${file}`);
      await seedFn();
    } else {
      console.warn(`⚠️ ${file} 에서 실행 가능한 seed 함수가 없습니다.`);
    }
  }

  console.log('\n✅ 모든 시드 실행 완료');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
