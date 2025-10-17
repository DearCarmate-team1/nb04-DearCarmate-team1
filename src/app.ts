import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';
import authRoute from './routes/auth-route.js';
import imageRoute from './routes/image-route.js';
import { errorHandler } from './middlewares/error-handler.js';
import customerRoutes from './routes/customerRoutes';
import carRoute from './routes/car-route.js';
import contractRouter from './routes/contract-route.js';

const app = express();
const port = 3001;

const allowedOrigins = ['http://localhost:3000']

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));


app.use('/companies', companyRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/images', imageRoute);
app.use('/customers', customerRoutes);
app.use('/cars', carRoute);
app.use('/contracts', contractRouter);

// 에러 핸들러 미들웨어는 가장 마지막에 등록
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

