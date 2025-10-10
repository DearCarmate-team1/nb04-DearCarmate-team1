import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';
<<<<<<< HEAD
import authRoute from './routes/auth-route.js';
import { errorHandler } from './middlewares/error-handler.js';
=======
>>>>>>> ee42218 (feat: 유저 CRUD API 유효성검사 제외)

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
<<<<<<< HEAD
app.use('/auth', authRoute);

// 에러 핸들러 미들웨어는 가장 마지막에 등록
app.use(errorHandler);
=======
>>>>>>> ee42218 (feat: 유저 CRUD API 유효성검사 제외)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


