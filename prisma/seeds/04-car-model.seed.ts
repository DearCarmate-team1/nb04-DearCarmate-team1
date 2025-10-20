import { PrismaClient, CarType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  const carModels = [
    // 🚘 현대
    { manufacturer: '현대', model: '아반떼', type: CarType.SEDAN },
    { manufacturer: '현대', model: '쏘나타', type: CarType.SEDAN },
    { manufacturer: '현대', model: '투싼', type: CarType.SUV },
    { manufacturer: '현대', model: '싼타페', type: CarType.SUV },
    { manufacturer: '현대', model: '포터2', type: CarType.TRUCK },
    { manufacturer: '현대', model: '스타리아', type: CarType.VAN },

    // 🚙 기아
    { manufacturer: '기아', model: 'K3', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K5', type: CarType.SEDAN },
    { manufacturer: '기아', model: '스포티지', type: CarType.SUV },
    { manufacturer: '기아', model: '쏘렌토', type: CarType.SUV },
    { manufacturer: '기아', model: '모닝', type: CarType.COMPACT },
    { manufacturer: '기아', model: '카니발', type: CarType.VAN },

    // 🚗 쉐보레
    { manufacturer: '쉐보레', model: '스파크', type: CarType.COMPACT },
    { manufacturer: '쉐보레', model: '말리부', type: CarType.SEDAN },
    { manufacturer: '쉐보레', model: '트랙스', type: CarType.SUV },
    { manufacturer: '쉐보레', model: '콜로라도', type: CarType.TRUCK },

    // ⚡ 테슬라
    { manufacturer: '테슬라', model: 'Model 3', type: CarType.SEDAN },
    { manufacturer: '테슬라', model: 'Model Y', type: CarType.SUV },
    { manufacturer: '테슬라', model: 'Model X', type: CarType.SUV },
    { manufacturer: '테슬라', model: 'Cybertruck', type: CarType.TRUCK },

    // 💎 벤츠
    { manufacturer: '벤츠', model: 'A200', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'C200', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'E300', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'GLC300', type: CarType.SUV },

    // 🏎️ 아우디
    { manufacturer: '아우디', model: 'A4', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'A6', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'Q5', type: CarType.SUV },
    { manufacturer: '아우디', model: 'Q7', type: CarType.SUV },
  ];

  for (const cm of carModels) {
    await prisma.carModel.upsert({
      where: { manufacturer_model: { manufacturer: cm.manufacturer, model: cm.model } },
      update: {},
      create: cm,
    });
  }

  console.log(`🚘 CarModel seed 완료 (${carModels.length}종 등록됨)`);
}
