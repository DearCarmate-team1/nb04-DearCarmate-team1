# Dear Carmate - 중고차 계약 관리 서비스 (백엔드)

중고차 딜러와 고객 간의 계약 과정을 효율적으로 관리하고, 관련 데이터를 체계적으로 기록하기 위한 백엔드 API 서버입니다.

## ✨ 주요 기능

- **사용자 관리:** 회원가입, 로그인, 내 정보 조회/수정/탈퇴
- **인증 시스템:** JWT(Access/Refresh Token) 기반의 인증 및 인가
- **회사 관리:** 딜러가 소속된 회사 정보 CRUD
- **고객 관리:** 잠재/계약 고객 정보 CRUD 및 CSV/XLSX 파일을 이용한 대용량 등록
- **차량 관리:** 판매 차량 정보 CRUD
- **계약 관리:** 차량-고객 간 계약 정보 관리
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
- **파일 처리:** Multer, csv-parser, xlsx

## 📂 프로젝트 아키텍처

본 프로젝트는 **계층형 아키텍처(Layered Architecture)**를 따릅니다. `src` 폴더 내부의 각 디렉토리는 명확한 역할과 책임을 가지며, 이를 통해 코드의 재사용성과 유지보수성을 높입니다.

- `configs`: Prisma 클라이언트, 상수 등 프로젝트의 주요 설정
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
- **feature/기능이름:** 새로운 기능을 개발하는 브랜치 (예: `feature/user-auth`)
- **bugfix/이슈번호:** 버그를 수정하는 브랜치 (예: `bugfix/issue-123`)

### 4. PR 규칙 (Pull Request Rules)

- 2명 이상의 팀원에게 **Approve**를 받아야 Merge 할 수 있습니다.

### 5. Prettier 규칙

- Prettier 포맷팅을 기본으로 사용합니다.
- 적용하고 싶지 않은 특정 부분이 있다면, 해당 부분 위에 아래 주석을 추가합니다.
  ```js
  // prettier-ignore
  ```

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

### 4. 데이터베이스 설정

Prisma 스키마를 실제 데이터베이스에 반영합니다.

```bash
npx prisma db push
```

## ⚙️ 실행하기

### 개발 모드 실행 (추천)

`nodemon`이 코드 변경을 감지하여 서버를 자동으로 재시작합니다.

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

## 📖 API 엔드포인트

주요 API 엔드포인트 목록입니다. (상세 내용은 API 명세서 참고)

| Method   | Endpoint            | 설명                  | 인증 필요  |
| :------- | :------------------ | :-------------------- | :--------: |
| `POST`   | `/users`            | 회원가입              |     ✅     |
| `POST`   | `/auth/login`       | 로그인 (토큰 발급)    |     ✅     |
| `POST`   | `/auth/refresh`     | 토큰 갱신             |     ✅     |
| `GET`    | `/users/me`         | 내 정보 조회          |     ✅     |
| `PATCH`  | `/users/me`         | 내 정보 수정          |     ✅     |
| `DELETE` | `/users/me`         | 회원 탈퇴             |     ✅     |
| `POST`   | `/companies`        | 회사 등록             | ✅ (Admin) |
| `GET`    | `/companies`        | 회사 목록 조회        |     ✅     |
| `GET`    | `/companies/users`  | 회사별 유저 목록 조회 |     ✅     |
| `PATCH`  | `/companies/:id`    | 회사 정보 수정        | ✅ (Admin) |
| `DELETE` | `/companies/:id`    | 회사 삭제             | ✅ (Admin) |
| `POST`   | `/customers`        | 고객 등록             |     ✅     |
| `POST`   | `/customers/upload` | 고객 대용량 업로드    |     ✅     |
| `GET`    | `/customers`        | 고객 목록 조회        |     ✅     |
| `GET`    | `/customers/:id`    | 고객 상세 조회        |     ✅     |
| `PATCH`  | `/customers/:id`    | 고객 정보 수정        |     ✅     |
| `DELETE` | `/customers/:id`    | 고객 삭제             |     ✅     |
