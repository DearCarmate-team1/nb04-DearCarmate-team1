import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  // OpenAPI 기본 명세
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dear Carmate API',
      version: '1.0.0',
      description: '중고차 계약 관리 서비스 Dear Carmate의 API 명세서입니다.',
    },
    // 인증 방식 (Bearer Token) 정의
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // 모든 API에 Bearer Token 인증을 기본으로 적용
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // swagger-jsdoc이 주석을 스캔할 파일 경로
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
