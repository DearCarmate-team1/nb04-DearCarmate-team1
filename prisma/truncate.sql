-- 모든 테이블 데이터만 삭제 (PostgreSQL 기준)
TRUNCATE TABLE 
    "contract_documents",
    "notifications",
    "meetings",
    "contracts",
    "cars",
    "car_models",
    "customers",
    "users",
    "companies" 
RESTART IDENTITY CASCADE;