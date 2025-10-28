import { PrismaClient, CarType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  const carModels = [
    // 🚘 현대
    { manufacturer: '현대', model: '아반떼', type: CarType.SEDAN },
    { manufacturer: '현대', model: '쏘나타', type: CarType.SEDAN },
    { manufacturer: '현대', model: '그랜저', type: CarType.SEDAN },
    { manufacturer: '현대', model: '제네시스 G70', type: CarType.SEDAN },
    { manufacturer: '현대', model: '제네시스 G80', type: CarType.SEDAN },
    { manufacturer: '현대', model: '제네시스 G90', type: CarType.SEDAN },
    { manufacturer: '현대', model: '코나', type: CarType.SUV },
    { manufacturer: '현대', model: '투싼', type: CarType.SUV },
    { manufacturer: '현대', model: '싼타페', type: CarType.SUV },
    { manufacturer: '현대', model: '팰리세이드', type: CarType.SUV },
    { manufacturer: '현대', model: '제네시스 GV70', type: CarType.SUV },
    { manufacturer: '현대', model: '제네시스 GV80', type: CarType.SUV },
    { manufacturer: '현대', model: '아이오닉5', type: CarType.SUV },
    { manufacturer: '현대', model: '아이오닉6', type: CarType.SEDAN },
    { manufacturer: '현대', model: '넥쏘', type: CarType.SUV },
    { manufacturer: '현대', model: '포터2', type: CarType.TRUCK },
    { manufacturer: '현대', model: '스타리아', type: CarType.VAN },

    // 🚙 기아
    { manufacturer: '기아', model: '모닝', type: CarType.COMPACT },
    { manufacturer: '기아', model: '레이', type: CarType.COMPACT },
    { manufacturer: '기아', model: 'K3', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K5', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K7', type: CarType.SEDAN },
    { manufacturer: '기아', model: 'K8', type: CarType.SEDAN },
    { manufacturer: '기아', model: '스팅어', type: CarType.SEDAN },
    { manufacturer: '기아', model: '셀토스', type: CarType.SUV },
    { manufacturer: '기아', model: '스포티지', type: CarType.SUV },
    { manufacturer: '기아', model: '쏘렌토', type: CarType.SUV },
    { manufacturer: '기아', model: '모하비', type: CarType.SUV },
    { manufacturer: '기아', model: 'EV6', type: CarType.SUV },
    { manufacturer: '기아', model: 'EV9', type: CarType.SUV },
    { manufacturer: '기아', model: '니로', type: CarType.SUV },
    { manufacturer: '기아', model: '카니발', type: CarType.VAN },

    // 🚗 쉐보레
    { manufacturer: '쉐보레', model: '스파크', type: CarType.COMPACT },
    { manufacturer: '쉐보레', model: '크루즈', type: CarType.SEDAN },
    { manufacturer: '쉐보레', model: '말리부', type: CarType.SEDAN },
    { manufacturer: '쉐보레', model: '임팔라', type: CarType.SEDAN },
    { manufacturer: '쉐보레', model: '트랙스', type: CarType.SUV },
    { manufacturer: '쉐보레', model: '이쿼녹스', type: CarType.SUV },
    { manufacturer: '쉐보레', model: '트레일블레이저', type: CarType.SUV },
    { manufacturer: '쉐보레', model: '타호', type: CarType.SUV },
    { manufacturer: '쉐보레', model: '콜로라도', type: CarType.TRUCK },

    // ⚡ 테슬라
    { manufacturer: '테슬라', model: 'Model S', type: CarType.SEDAN },
    { manufacturer: '테슬라', model: 'Model 3', type: CarType.SEDAN },
    { manufacturer: '테슬라', model: 'Model X', type: CarType.SUV },
    { manufacturer: '테슬라', model: 'Model Y', type: CarType.SUV },
    { manufacturer: '테슬라', model: 'Cybertruck', type: CarType.TRUCK },

    // 💎 벤츠
    { manufacturer: '벤츠', model: 'A200', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'C200', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'C300', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'E200', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'E300', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'S400', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'S500', type: CarType.SEDAN },
    { manufacturer: '벤츠', model: 'GLA200', type: CarType.SUV },
    { manufacturer: '벤츠', model: 'GLC300', type: CarType.SUV },
    { manufacturer: '벤츠', model: 'GLE350', type: CarType.SUV },
    { manufacturer: '벤츠', model: 'GLS450', type: CarType.SUV },
    { manufacturer: '벤츠', model: 'EQS', type: CarType.SEDAN },

    // 🏎️ BMW
    { manufacturer: 'BMW', model: '3시리즈', type: CarType.SEDAN },
    { manufacturer: 'BMW', model: '5시리즈', type: CarType.SEDAN },
    { manufacturer: 'BMW', model: '7시리즈', type: CarType.SEDAN },
    { manufacturer: 'BMW', model: 'X1', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'X3', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'X5', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'X7', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'iX', type: CarType.SUV },
    { manufacturer: 'BMW', model: 'i4', type: CarType.SEDAN },

    // 🔵 아우디
    { manufacturer: '아우디', model: 'A3', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'A4', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'A6', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'A8', type: CarType.SEDAN },
    { manufacturer: '아우디', model: 'Q3', type: CarType.SUV },
    { manufacturer: '아우디', model: 'Q5', type: CarType.SUV },
    { manufacturer: '아우디', model: 'Q7', type: CarType.SUV },
    { manufacturer: '아우디', model: 'Q8', type: CarType.SUV },
    { manufacturer: '아우디', model: 'e-tron', type: CarType.SUV },

    // 🏁 포르쉐
    { manufacturer: '포르쉐', model: '911', type: CarType.SEDAN },
    { manufacturer: '포르쉐', model: '파나메라', type: CarType.SEDAN },
    { manufacturer: '포르쉐', model: '카이엔', type: CarType.SUV },
    { manufacturer: '포르쉐', model: '마칸', type: CarType.SUV },
    { manufacturer: '포르쉐', model: '타이칸', type: CarType.SEDAN },

    // 🔷 볼보
    { manufacturer: '볼보', model: 'S60', type: CarType.SEDAN },
    { manufacturer: '볼보', model: 'S90', type: CarType.SEDAN },
    { manufacturer: '볼보', model: 'XC40', type: CarType.SUV },
    { manufacturer: '볼보', model: 'XC60', type: CarType.SUV },
    { manufacturer: '볼보', model: 'XC90', type: CarType.SUV },

    // 🌸 렉서스
    { manufacturer: '렉서스', model: 'ES300', type: CarType.SEDAN },
    { manufacturer: '렉서스', model: 'LS500', type: CarType.SEDAN },
    { manufacturer: '렉서스', model: 'NX350', type: CarType.SUV },
    { manufacturer: '렉서스', model: 'RX350', type: CarType.SUV },
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
