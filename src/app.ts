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
import customerRoute from './routes/customer-route.js';
import carRoute from './routes/car-route.js';
import dashboardRoute from './routes/dashboard-route.js';
import contractRoute from './routes/contract-route.js';
import contractDocumentRoute from './routes/contract-document-route.js';

import { PORT, CORS_ORIGINS, NODE_ENV, BASE_URL } from './configs/constants.js';
import { notFoundHandler } from './middlewares/not-found-handler.js';
import { errorHandler } from './middlewares/error-handler.js';


const app = express();
const port = Number(PORT) || 3001;

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

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

if (NODE_ENV === 'development') {
  app.use('/uploads', express.static('uploads'));
  console.log('[INFO] Development mode: Static file serving enabled at /uploads');
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/companies', companyRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/images', imageRoute);
app.use('/customers', customerRoute);
app.use('/cars', carRoute);
app.use('/dashboard', dashboardRoute);
app.use('/contracts', contractRoute);
app.use('/contractDocuments', contractDocumentRoute);

app.use(notFoundHandler);

app.use(errorHandler);

const server = app.listen(port, () => {
  if (NODE_ENV === 'development') {
    console.log(`[INFO] Server running at http://localhost:${port}`);
  } else {
    console.log(`[INFO] Server running at ${BASE_URL || `port ${port}`}`);
  }
  console.log(`[INFO] Environment: ${NODE_ENV}`);
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[INFO] ${signal} received. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.log('[WARN] Shutdown timeout. Force exiting...');
    process.exit(1);
  }, 5000);

  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('[INFO] Server closed successfully');
      process.exit(0);
    });
  } catch (err) {
    console.error('[ERROR] Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason: Error | any) => {
  console.error('[ERROR] Unhandled Promise Rejection:', reason);
  console.error('[ERROR] Stack:', reason?.stack);

  if (NODE_ENV === 'production') {
    shutdown('UNHANDLED_REJECTION');
  }
});

process.on('uncaughtException', (error: Error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  console.error('[ERROR] Stack:', error.stack);

  shutdown('UNCAUGHT_EXCEPTION');
});
