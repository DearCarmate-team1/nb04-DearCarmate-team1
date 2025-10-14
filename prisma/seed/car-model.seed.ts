// prisma/seed/car-model.seed.ts
import { PrismaClient, CarType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const carModels = [
    // 🚗 현대
    { manufacturer: '현대', model: '아반떼', type: CarType.SEDAN },
    { manufacturer: '현대', model: '쏘나타', type: CarType.SEDAN },
    { manufacturer: '현대', model: '그랜저', type: CarType.SEDAN },
    { manufacturer: '현대', model: '투싼', type: CarType.SUV },
    { manufacturer: '현대', model: '싼타페', type: CarType.SUV },

    // 🚙 기아
    { manufacturer: '기아', model: 'K3', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K5', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K7', type: CarType.SEDAN },
    { manufacturer: '기아', model: '스포티지', type: CarType.SUV },
    { manufacturer: '기아', model: '쏘렌토', type: CarType.SUV },

    // 🚘 BMW
    { manufacturer: 'BMW', model: '320i', type: CarType.SEDAN },
    { manufacturer: 'BMW', model: '520d', type: CarType.SEDAN },
    { manufacturer: 'BMW', model: 'X3', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'X5', type: CarType.SUV },

    // 🚗 벤츠
    { manufacturer: 'Mercedes-Benz', model: 'C200', type: CarType.SEDAN },
    { manufacturer: 'Mercedes-Benz', model: 'E300', type: CarType.SEDAN },
    { manufacturer: 'Mercedes-Benz', model: 'GLC300', type: CarType.SUV },

    // 🚗 쉐보레
    { manufacturer: '쉐보레', model: '스파크', type: CarType.COMPACT },
    { manufacturer: '쉐보레', model: '말리부', type: CarType.SEDAN },
    { manufacturer: '쉐보레', model: '트래버스', type: CarType.SUV },

    // 🚙 제네시스
    { manufacturer: '제네시스', model: 'G70', type: CarType.SEDAN },
    { manufacturer: '제네시스', model: 'G80', type: CarType.SEDAN },
    { manufacturer: '제네시스', model: 'GV70', type: CarType.SUV },
  ];

  for (const model of carModels) {
    await prisma.carModel.upsert({
      where: {
        manufacturer_model: { manufacturer: model.manufacturer, model: model.model },
      },
      update: {},
      create: model,
    });
  }

  console.log(`✅ CarModel ${carModels.length}개 시드 완료!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
