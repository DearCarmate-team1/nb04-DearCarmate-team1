# Dear Carmate - 중고차 계약 관리 서비스

[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)](https://nb04-dearcarmate-team1.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel)](https://dearcarmate-frontend.vercel.app/)
[![API Docs](https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger)](https://nb04-dearcarmate-team1.onrender.com/api-docs)

중고차 딜러와 고객 간의 계약 과정을 효율적으로 관리하고, 관련 데이터를 체계적으로 기록하기 위한 백엔드 API 서버입니다.

## 🔗 링크

- **배포된 백엔드**: https://nb04-dearcarmate-team1.onrender.com
- **배포된 프론트엔드**: https://dearcarmate-frontend.vercel.app/
- **API 문서 (Swagger)**: https://nb04-dearcarmate-team1.onrender.com/api-docs

## ✨ 주요 기능

- **인증 시스템**: JWT(Access/Refresh Token) 기반의 인증 및 인가
- **사용자 관리**: 회원가입, 로그인, 내 정보 조회/수정/탈퇴
- **어드민 기능**: 회사 등록 및 관리, 소속 유저 관리
- **고객 관리**: 잠재/계약 고객 정보 CRUD 및 CSV 파일을 이용한 대용량 등록
- **차량 관리**: 판매 차량 정보 CRUD 및 CSV 대용량 등록
- **계약 관리**: 차량-고객 간 계약 정보 CRUD 및 칸반 보드 형태의 목록 제공
- **계약서 관리**: 계약별 문서(`pdf`, `doc`, `docx`) 업로드, 다운로드, 관리
- **대시보드**: 월별 매출, 계약 현황 등 핵심 지표 통계 제공
- **이미지 업로드**: Cloudinary를 이용한 범용 이미지 업로드 (예: 프로필 사진)
- **이메일 알림**: SendGrid를 이용한 계약 관련 이메일 알림 발송
- **유효성 검사**: `zod`를 이용한 요청 데이터 유효성 검사
- **에러 핸들링**: 글로벌 에러 핸들러를 통한 일관된 에러 응답 처리

## 🛠️ 기술 스택

### 핵심 기술
- **런타임**: Node.js v18.x 이상
- **패키지 매니저**: npm v9.x 이상
- **언어**: TypeScript v5.9+
- **프레임워크**: Express.js v5.1+
- **데이터베이스**: PostgreSQL v14+ (권장)
- **ORM**: Prisma v6.16+

### 주요 라이브러리
- **인증**: JWT (jsonwebtoken)
- **유효성 검사**: Zod
- **파일 처리**: Multer, Cloudinary
- **CSV 처리**: csv-parse
- **이메일**: SendGrid
- **보안**: Helmet, bcrypt
- **API 문서**: Swagger (swagger-jsdoc, swagger-ui-express)

## 📂 프로젝트 구조

```
root/
├── src/
│   ├── app.ts                    # Express 애플리케이션 진입점
│   ├── configs/                  # 설정 파일
│   │   ├── prisma-client.ts      # Prisma 클라이언트 인스턴스
│   │   ├── swagger.ts            # Swagger API 문서 설정
│   │   ├── multer.ts             # 파일 업로드 설정
│   │   ├── cloudinary-config.ts  # Cloudinary 이미지 업로드 설정
│   │   ├── token.ts              # JWT 토큰 유틸리티
│   │   ├── custom-error.ts       # 커스텀 에러 클래스
│   │   ├── constants.ts          # 상수 정의
│   │   └── async-handler.ts      # 비동기 핸들러 래퍼
│   ├── routes/                   # API 라우트 정의
│   │   ├── auth-route.ts
│   │   ├── user-route.ts
│   │   ├── company-route.ts
│   │   ├── customer-route.ts
│   │   ├── car-route.ts
│   │   ├── contract-route.ts
│   │   ├── contract-document-route.ts
│   │   ├── dashboard-route.ts
│   │   └── image-route.ts
│   ├── middlewares/              # 미들웨어
│   │   ├── authenticate.ts       # JWT 인증
│   │   ├── authorize.ts          # 권한 검증 (Admin)
│   │   ├── validate.ts           # Zod 스키마 유효성 검사
│   │   ├── error-handler.ts      # 전역 에러 핸들러
│   │   └── not-found-handler.ts  # 404 핸들러
│   ├── controllers/              # 컨트롤러 (HTTP 요청/응답 처리)
│   │   ├── auth-controller.ts
│   │   ├── user-controller.ts
│   │   ├── company-controller.ts
│   │   ├── customer-controller.ts
│   │   ├── car-controller.ts
│   │   ├── contract-controller.ts
│   │   ├── contract-document-controller.ts
│   │   ├── dashboard-controller.ts
│   │   └── image-controller.ts
│   ├── services/                 # 서비스 (비즈니스 로직)
│   │   ├── auth-service.ts
│   │   ├── user-service.ts
│   │   ├── company-service.ts
│   │   ├── customer-service.ts
│   │   ├── car-service.ts
│   │   ├── contract-service.ts
│   │   ├── contract-document-service.ts
│   │   ├── dashboard-service.ts
│   │   ├── email-service.ts
│   │   └── image-service.ts
│   ├── repositories/             # 리포지토리 (데이터 액세스)
│   │   ├── user-repository.ts
│   │   ├── company-repository.ts
│   │   ├── customer-repository.ts
│   │   ├── car-repository.ts
│   │   ├── car-model-repository.ts
│   │   ├── contract-repository.ts
│   │   ├── contract-document-repository.ts
│   │   └── dashboard-repository.ts
│   ├── dtos/                     # 데이터 전송 객체 (Zod 스키마)
│   │   ├── auth-dto.ts
│   │   ├── user-dto.ts
│   │   ├── company-dto.ts
│   │   ├── customer-dto.ts
│   │   ├── car-dto.ts
│   │   ├── contract-dto.ts
│   │   └── dashboard-dto.ts
│   └── types/                    # 공통 타입 정의
│       ├── auth-user.ts
│       ├── customer.ts
│       ├── car.ts
│       ├── contract.ts
│       ├── express.d.ts
│       └── prisma.d.ts
├── prisma/
│   ├── schema.prisma             # Prisma 스키마 정의
│   ├── seed.ts                   # 샘플 데이터 생성 스크립트
│   └── migrations/               # 데이터베이스 마이그레이션
├── uploads/                      # 업로드된 파일 저장소 (로컬)
│   ├── documents/                # 계약서 문서 (PDF, DOC, DOCX)
│   └── images/                   # 이미지 파일
├── tests/                        # 테스트 파일
├── docs/                         # 프로젝트 문서
├── .env                          # 환경 변수 (gitignore)
├── .env.sample                   # 환경 변수 예시
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗️ 아키텍처

본 프로젝트는 **계층형 아키텍처(Layered Architecture)**를 따릅니다.

### 핵심 계층 구조

```
┌─────────────────────────────────────────┐
│       Client (Frontend/Mobile)          │
└────────────────┬────────────────────────┘
                 │ HTTP Request
                 ▼
┌─────────────────────────────────────────┐
│            Routes                       │
│  - API 엔드포인트 정의                    │
│  - 미들웨어 연결                          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Middlewares                    │
│  - authenticate: JWT 검증                │
│  - authorize: 권한 확인                   │
│  - validate: Zod 스키마 검증             │
│  - errorHandler: 에러 처리               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Controllers                    │
│  - HTTP 요청 수신                        │
│  - req.body/query/params 추출            │
│  - Service 호출                          │
│  - HTTP 응답 전송                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│            Services                     │
│  - 비즈니스 로직 구현                     │
│  - 트랜잭션 관리                         │
│  - 다른 서비스 호출                      │
│  - Repository 호출                       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Repositories                   │
│  - Prisma 쿼리 실행                      │
│  - CRUD 연산                            │
│  - 데이터베이스 직접 통신                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Database (PostgreSQL)             │
└─────────────────────────────────────────┘
```

### API 요청 흐름

```
Request → Route → Middleware(Auth, Validate) → Controller → Service → Repository → Database
```

## 🗄️ 데이터베이스 ERD

### 핵심 엔티티 관계도

```mermaid
erDiagram
    Company ||--o{ User : "1:N"
    Company ||--o{ Customer : "1:N"
    Company ||--o{ Car : "1:N"
    Company ||--o{ Contract : "1:N"

    CarModel ||--o{ Car : "1:N"
    Car ||--o{ Contract : "1:N"
    Customer ||--o{ Contract : "1:N"
    User ||--o{ Contract : "1:N"

    Contract ||--o{ ContractDocument : "1:N"
    Contract ||--o{ Meeting : "1:N"

    Company {
        int id PK "회사 ID"
        string name "회사명"
        string authCode UK "인증코드"
    }

    User {
        int id PK "사용자 ID"
        string name "이름"
        string email UK "이메일"
        string employeeNumber UK "사번"
        boolean isAdmin "관리자 여부"
        int companyId FK "소속 회사"
    }

    Customer {
        int id PK "고객 ID"
        string name "이름"
        string phoneNumber "전화번호"
        string email "이메일"
        int companyId FK "담당 회사"
    }

    Car {
        int id PK "차량 ID"
        string carNumber UK "차량번호"
        int price "가격"
        enum status "차량 상태"
        int modelId FK "차량 모델"
        int companyId FK "보유 회사"
    }

    CarModel {
        int id PK "모델 ID"
        string manufacturer "제조사"
        string model "모델명"
        enum type "차종"
    }

    Contract {
        int id PK "계약 ID"
        enum status "계약 상태"
        int contractPrice "계약 금액"
        int carId FK "차량"
        int customerId FK "고객"
        int userId FK "담당자"
        int companyId FK "회사"
    }

    ContractDocument {
        int id PK "문서 ID"
        string fileName "파일명"
        string fileKey UK "파일 키"
        int contractId FK "계약"
    }

    Meeting {
        int id PK "미팅 ID"
        datetime date "미팅 일시"
        int contractId FK "계약"
    }
```

### Enum 타입

**CarType (차종)**
- `SEDAN`: 세단
- `SUV`: SUV
- `COMPACT`: 소형
- `TRUCK`: 트럭
- `VAN`: 밴

**CarStatus (차량 상태)**
- `possession`: 보유 중
- `contractProceeding`: 계약 진행 중
- `contractCompleted`: 계약 완료

**ContractStatus (계약 상태)**
- `carInspection`: 차량 확인
- `priceNegotiation`: 가격 협의
- `contractDraft`: 계약서 작성 중
- `contractSuccessful`: 계약 완료
- `contractFailed`: 계약 취소

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone [저장소_URL]
cd dearcarmate-backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 있는 `.env.sample` 파일을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.sample .env
```

**필요한 환경 변수:**

```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/dearcarmate

# JWT 토큰
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary (이미지 업로드)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid (이메일 발송)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@dearcarmate.com

# 서버 설정 (개발 환경)
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000

# 서버 설정 (프로덕션 환경 예시)
# PORT=3001
# NODE_ENV=production
# BASE_URL=https://nb04-dearcarmate-team1.onrender.com
# CORS_ORIGINS=https://dearcarmate-frontend.vercel.app

# 파일 다운로드 토큰
DOWNLOAD_TOKEN_SECRET=your-download-token-secret
```

### 4. 데이터베이스 설정

Prisma 스키마를 실제 데이터베이스에 반영합니다.

```bash
# 개발 환경: 마이그레이션 생성 및 적용
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate
```

### 5. 샘플 데이터 생성 (선택사항)

개발 및 테스트에 필요한 샘플 데이터를 데이터베이스에 추가합니다.

```bash
# DB의 모든 데이터를 지우고, 처음부터 모든 샘플 데이터를 다시 생성
npm run db:refresh

# 기존 데이터를 유지한 채, 샘플 데이터만 추가
npm run db:seed
```

## ⚙️ 실행하기

### 개발 모드 (추천)

`tsx`가 코드 변경을 감지하여 서버를 자동으로 재시작합니다.

```bash
npm run dev
```

### 프로덕션 모드

```bash
# 1. TypeScript 빌드
npm run build

# 2. 빌드된 서버 실행
npm start

# 또는 마이그레이션 + 서버 실행을 한 번에
npm run start:prod
```

## 📖 API 문서

서버 실행 후, Swagger UI를 통해 API 명세를 확인하고 직접 테스트할 수 있습니다.

**로컬**: http://localhost:3001/api-docs
**배포**: https://nb04-dearcarmate-team1.onrender.com/api-docs

## 📋 주요 API 엔드포인트

| Method   | Endpoint                      | 설명                        | 인증 필요  |
| :------- | :---------------------------- | :-------------------------- | :--------: |
| `POST`   | `/auth/login`                 | 로그인 (토큰 발급)          |     -      |
| `POST`   | `/auth/refresh`               | 토큰 갱신                   |     -      |
| `POST`   | `/users`                      | 회원가입                    |     -      |
| `GET`    | `/users/me`                   | 내 정보 조회                |     ✅     |
| `PATCH`  | `/users/me`                   | 내 정보 수정                |     ✅     |
| `DELETE` | `/users/me`                   | 회원 탈퇴                   |     ✅     |
| `POST`   | `/companies`                  | 회사 등록                   | ✅ (Admin) |
| `GET`    | `/companies`                  | 회사 목록 조회              |     ✅     |
| `POST`   | `/customers`                  | 고객 등록                   |     ✅     |
| `GET`    | `/customers`                  | 고객 목록 조회              |     ✅     |
| `POST`   | `/customers/upload`           | 고객 대용량 업로드 (CSV)    |     ✅     |
| `POST`   | `/cars`                       | 차량 등록                   |     ✅     |
| `GET`    | `/cars`                       | 차량 목록 조회              |     ✅     |
| `GET`    | `/cars/models`                | 차량 제조사/모델 목록 조회  |     ✅     |
| `POST`   | `/cars/upload`                | 차량 대용량 업로드 (CSV)    |     ✅     |
| `POST`   | `/contracts`                  | 계약 등록                   |     ✅     |
| `GET`    | `/contracts`                  | 계약 목록 조회 (칸반)       |     ✅     |
| `PATCH`  | `/contracts/:id`              | 계약 수정                   |     ✅     |
| `GET`    | `/contractDocuments`          | 계약서 목록 조회 (페이지네이션) |     ✅     |
| `GET`    | `/contractDocuments/draft`    | 초안 계약서 목록 조회       |     ✅     |
| `POST`   | `/contractDocuments/upload`   | 계약서 파일 업로드          |     ✅     |
| `GET`    | `/contractDocuments/download` | 토큰 기반 계약서 다운로드   |     ✅      |
| `GET`    | `/contractDocuments/:id/download` | 계약서 파일 다운로드 (인증) |     ✅     |
| `GET`    | `/dashboard`                  | 대시보드 통계 조회          |     ✅     |
| `POST`   | `/images/upload`              | 범용 이미지 업로드          |     ✅     |

## 💻 코딩 컨벤션

### 1. 네이밍 컨벤션

| 대상       | 표기법     | 예시                                |
| :--------- | :--------- | :---------------------------------- |
| 변수, 함수 | camelCase  | `userName`, `getUserData`           |
| 클래스     | PascalCase | `UserService`, `CustomerController` |
| 파일, 폴더 | kebab-case | `user-service.ts`, `auth-route.ts`  |

### 2. 커밋 컨벤션

커밋 메시지는 다음 형식을 따릅니다: `타입: 제목`

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **refactor**: 코드 리팩토링 (기능 변경 없음)
- **docs**: 문서 수정 (README 등)
- **style**: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- **test**: 테스트 코드 추가 또는 수정
- **chore**: 빌드 관련 파일 수정, 패키지 매니저 설정 변경 등

**예시**: `feat: 계약서 이메일 알림 기능 추가`

### 3. 브랜치 전략

- **main**: 배포 가능한 안정적인 버전의 브랜치
- **develop**: 다음 배포 버전을 개발하는 메인 브랜치
- **feature/기능이름**: 새로운 기능을 개발하는 브랜치 (예: `feature/user-auth`)
- **fix/이슈번호**: 버그를 수정하는 브랜치 (예: `fix/issue-123`)

### 4. PR 규칙

- 2명 이상의 팀원에게 **Approve**를 받아야 Merge 할 수 있습니다.

## 📚 개발 가이드

### 새로운 기능 추가 시

1. Prisma 스키마 수정 (필요 시) → `npx prisma migrate dev`
2. DTOs 작성 (`dtos/`)
3. Repository 작성 (`repositories/`)
4. Service 작성 (`services/`)
5. Controller 작성 (`controllers/`)
6. Route 작성 (`routes/`)
7. `src/app.ts`에 라우트 등록
8. Swagger JSDoc 주석 추가

### 데이터베이스 관리

```bash
# Prisma Client 재생성
npx prisma generate

# 마이그레이션 생성 및 적용 (개발)
npx prisma migrate dev

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy

# 스키마 검증
npx prisma validate

# DB 초기화
npm run db:clear
npm run db:seed
```

### 코드 품질

```bash
# Prettier 실행
npm run format
```

## 📄 라이선스

This project is private and proprietary.

## 👥 팀원

**Dear Carmate Backend Team**

- 김지헌 (ziheon01)
- 홍주헌 (jhhong0571)
- 최홍기 (qhdltmwhs)
- 오연진 (yonjinoh)

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.
