# Dear Carmate - 중고차 계약 관리 서비스 (백엔드)

중고차 딜러와 고객 간의 계약 과정을 효율적으로 관리하고, 관련 데이터를 체계적으로 기록하기 위한 백엔드 API 서버입니다.

## ✨ 주요 기능

- **인증 시스템:** JWT(Access/Refresh Token) 기반의 인증 및 인가
- **사용자 관리:** 회원가입, 로그인, 내 정보 조회/수정/탈퇴
- **어드민 기능:** 회사 등록 및 관리, 소속 유저 관리
- **고객 관리:** 잠재/계약 고객 정보 CRUD 및 CSV/XLSX 파일을 이용한 대용량 등록
- **차량 관리:** 판매 차량 정보 CRUD 및 CSV 대용량 등록
- **계약 관리:** 차량-고객 간 계약 정보 CRUD 및 칸반 보드 형태의 목록 제공
- **계약서 관리:** 계약별 문서(`pdf`, `doc`, `docx`) 업로드, 다운로드, 관리
- **대시보드:** 월별 매출, 계약 현황 등 핵심 지표 통계 제공
- **이미지 업로드:** Cloudinary를 이용한 범용 이미지 업로드 (예: 프로필 사진)
- **유효성 검사:** `zod`를 이용한 요청 데이터 유효성 검사
- **에러 핸들링:** 글로벌 에러 핸들러를 통한 일관된 에러 응답 처리

## 🛠️ 기술 스택

- **런타임:** Node.js
- **프레임워크:** Express.js
- **언어:** TypeScript
- **데이터베이스:** PostgreSQL
- **ORM:** Prisma
- **인증:** JWT (jsonwebtoken)
- **유효성 검사:** Zod
- **파일 처리:** Multer, Cloudinary, csv-parser, xlsx
- **API 문서:** Swagger (swagger-jsdoc, swagger-ui-express)

## 📂 프로젝트 아키텍처

본 프로젝트는 **계층형 아키텍처(Layered Architecture)**를 따릅니다. `src` 폴더 내부의 각 디렉토리는 명확한 역할과 책임을 가지며, 이를 통해 코드의 재사용성과 유지보수성을 높입니다.

- `configs`: Prisma 클라이언트, Swagger, Multer 등 프로젝트의 주요 설정
- `routes`: API 엔드포인트를 정의하고, 요청을 적절한 컨트롤러로 연결
- `middlewares`: 요청 처리 전후의 공통 로직 (인증, 유효성 검사, 에러 핸들링 등)
- `controllers`: HTTP 요청을 받아 서비스 계층으로 작업을 위임하고, 최종 응답을 반환
- `services`: 애플리케이션의 핵심 비즈니스 로직을 수행
- `repositories`: 데이터베이스와의 통신(CRUD)을 직접 담당
- `dtos`: 데이터 전송 객체(DTO)의 타입 및 유효성 검사 스키마를 정의
- `types`: 프로젝트 전역에서 사용되는 공통 타입 정의

### 🌊 API 요청 흐름

`Request` → `Route` → `Middleware(Auth, Validate)` → `Controller` → `Service` → `Repository` → `Database`

## 💻 코딩 컨벤션

이 문서는 우리 팀의 원활한 협업을 위한 개발 규칙을 정의합니다.

### 1. 네이밍 컨벤션 (Naming Convention)

| 대상       | 표기법     | 예시                                |
| :--------- | :--------- | :---------------------------------- |
| 변수, 함수 | camelCase  | `userName`, `getUserData`           |
| 클래스     | PascalCase | `UserService`, `CustomerController` |
| 파일, 폴더 | kebab-case | `user-service.ts`, `auth-router.js` |

### 2. 커밋 컨벤션 (Commit Convention)

커밋 메시지는 다음 형식과 타입을 따릅니다. `타입: 제목` (예: `feat: 로그인 API 추가`)

- **feat:** 새로운 기능 추가
- **fix:** 버그 수정
- **refactor:** 코드 리팩토링 (기능 변경 없음)
- **docs:** 문서 수정 (README 등)
- **style:** 코드 스타일 변경 (포맷팅, 세미콜론 등)
- **test:** 테스트 코드 추가 또는 수정
- **chore:** 빌드 관련 파일 수정, 패키지 매니저 설정 변경 등

### 3. 브랜치 전략 (Branch Strategy)

- **main:** 배포 가능한 안정적인 버전의 브랜치
- **develop:** 다음 배포 버전을 개발하는 메인 브랜치
- **feature/기능이름:** 새로운 기능을 개발하는 브랜치 (예: `feature/user-auth`)
- **fix/이슈번호:** 버그를 수정하는 브랜치 (예: `fix/issue-123`)

### 4. PR 규칙 (Pull Request Rules)

- 2명 이상의 팀원에게 **Approve**를 받아야 Merge 할 수 있습니다.

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

프로젝트 루트에 있는 `.env.sample` 파일을 복사하여 `.env` 파일을 생성합니다. 그 후, 파일 내부의 환경 변수들을 자신의 로컬 환경에 맞게 수정합니다.

```bash
cp .env.sample .env
```

**필요한 환경 변수:**

- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 주소
- `ACCESS_TOKEN_SECRET`: JWT Access Token 서명에 사용할 비밀 키
- `REFRESH_TOKEN_SECRET`: JWT Refresh Token 서명에 사용할 비밀 키
- `ACCESS_TOKEN_EXPIRES_IN`: Access Token 만료 시간 (예: `15m`)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh Token 만료 시간 (예: `7d`)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary 계정의 Cloud Name
- `CLOUDINARY_API_KEY`: Cloudinary API Key
- `CLOUDINARY_API_SECRET`: Cloudinary API Secret

### 4. 데이터베이스 마이그레이션

Prisma 스키마를 실제 데이터베이스에 반영합니다.

```bash
npx prisma migrate dev
# 또는 npx prisma db push
```

### 5. 샘플 데이터 생성 (선택사항)

개발 및 테스트에 필요한 샘플 데이터를 데이터베이스에 추가합니다.

```bash
# DB의 모든 데이터를 지우고, 처음부터 모든 샘플 데이터를 다시 생성합니다.
npm run db:refresh

# 기존 데이터를 유지한 채, 샘플 데이터만 추가합니다.
npm run db:seed
```

## ⚙️ 실행하기

### 개발 모드 실행 (추천)

`tsx`가 코드 변경을 감지하여 서버를 자동으로 재시작합니다.

```bash
npm run dev
```

### 프로덕션 모드 실행

```bash
# 1. 타입스크립트 코드를 자바스크립트로 빌드
npm run build

# 2. 빌드된 서버 실행
npm start
```

## 📖 API 문서

개발 중인 API의 상세 명세는 Swagger UI를 통해 확인하고 직접 테스트해볼 수 있습니다.

**서버 실행 후, 아래 주소로 접속하세요.**

- [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

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
| `GET`    | `/companies/users`            | 회사별 유저 목록 조회       | ✅ (Admin) |
| `PATCH`  | `/companies/:id`              | 회사 정보 수정              | ✅ (Admin) |
| `DELETE` | `/companies/:id`              | 회사 삭제                   | ✅ (Admin) |
| `POST`   | `/customers`                  | 고객 등록                   |     ✅     |
| `GET`    | `/customers`                  | 고객 목록 조회              |     ✅     |
| `GET`    | `/customers/:id`              | 고객 상세 조회              |     ✅     |
| `PATCH`  | `/customers/:id`              | 고객 정보 수정              |     ✅     |
| `DELETE` | `/customers/:id`              | 고객 삭제                   |     ✅     |
| `POST`   | `/customers/upload`           | 고객 대용량 업로드 (CSV)    |     ✅     |
| `POST`   | `/cars`                       | 차량 등록                   |     ✅     |
| `GET`    | `/cars`                       | 차량 목록 조회              |     ✅     |
| `GET`    | `/cars/models`                | 차량 제조사/모델 목록 조회  |     ✅     |
| `GET`    | `/cars/:id`                   | 차량 상세 조회              |     ✅     |
| `PATCH`  | `/cars/:id`                   | 차량 정보 수정              |     ✅     |
| `DELETE` | `/cars/:id`                   | 차량 삭제                   |     ✅     |
| `POST`   | `/cars/upload`                | 차량 대용량 업로드 (CSV)    |     ✅     |
| `POST`   | `/contracts`                  | 계약 등록                   |     ✅     |
| `GET`    | `/contracts`                  | 계약 목록 조회 (칸반)       |     ✅     |
| `PATCH`  | `/contracts/:id`              | 계약 수정                   |     ✅     |
| `DELETE` | `/contracts/:id`              | 계약 삭제                   |     ✅     |
| `POST`   | `/contractDocuments/upload`   | 계약서 파일 업로드          |     ✅     |
| `GET`    | `/contractDocuments/:id/download` | 계약서 파일 다운로드        |     ✅     |
| `GET`    | `/dashboard`                  | 대시보드 통계 조회          |     ✅     |
| `POST`   | `/images/upload`              | 범용 이미지 업로드          |     ✅     |