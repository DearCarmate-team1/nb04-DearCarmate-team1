import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import prisma from './configs/prisma-client.js';
import { specs } from './configs/swagger.js';
import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';
import authRoute from './routes/auth-route.js';
import imageRoute from './routes/image-route.js';
import customerRoutes from './routes/customer-routes.js';
import carRoute from './routes/car-route.js';
import dashboardRoute from './routes/dashboard-route.js';
import contractRoute from './routes/contract-route.js';
import contractDocumentRoute from './routes/contract-document-routes.js';

import { PORT, CORS_ORIGINS, NODE_ENV, BASE_URL } from './configs/constants.js';
import { notFoundHandler } from './middlewares/not-found-handler.js';
import { errorHandler } from './middlewares/error-handler.js';


const app = express();
const port = Number(PORT) || 3001;

// ==========================
// 🛡️ 보안 헤더 (Helmet)
// ==========================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ==========================
// 🧾 HTTP 로깅 (Morgan)
// ==========================
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================
// 🌐 기본 미들웨어
// ==========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

// ==========================
// 📁 정적 파일 서빙 (개발 환경만)
// ==========================
if (NODE_ENV === 'development') {
  app.use('/uploads', express.static('uploads'));
  console.log('📁 개발 환경: /uploads 정적 파일 서빙 활성화');
}

// ==========================
// 🏥 헬스체크
// ==========================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==========================
// 📖 API 문서 (Swagger)
// ==========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ==========================
// 🧩 라우터 등록
// ==========================
app.use('/companies', companyRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/images', imageRoute);
app.use('/customers', customerRoutes);
app.use('/cars', carRoute);
app.use('/dashboard', dashboardRoute);
app.use('/contracts', contractRoute);
app.use('/contractDocuments', contractDocumentRoute);

// ==========================
// ❌ 404 핸들러
// ==========================
app.use(notFoundHandler);

// ==========================
// ⚠️ 글로벌 에러 핸들러
// ==========================
app.use(errorHandler);

// ==========================
// 🖥️ 서버 시작
// ==========================
const server = app.listen(port, () => {
  if (NODE_ENV === 'development') {
    console.log(`🚀 Server is running at http://localhost:${port}`);
  } else {
    console.log(`🚀 Server is running at ${BASE_URL || `port ${port}`}`);
  }
  console.log(`📌 Environment: ${NODE_ENV}`);
});

// ==========================
// 🧹 Graceful Shutdown
// ==========================
let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return; // 🔥 이미 처리 중이면 무시
  isShuttingDown = true;
  console.log(`\n🛑 [${signal}] Gracefully shutting down...`);

  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('✅ Server closed. Bye 👋');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ==========================
// 💥 예상치 못한 에러 처리
// ==========================
process.on('unhandledRejection', (reason: Error | any) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  console.error('Stack:', reason?.stack);

  // 프로덕션에서는 서버 종료
  if (NODE_ENV === 'production') {
    shutdown('UNHANDLED_REJECTION');
  }
});

process.on('uncaughtException', (error: Error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Stack:', error.stack);

  // 심각한 에러이므로 무조건 종료
  shutdown('UNCAUGHT_EXCEPTION');
});
