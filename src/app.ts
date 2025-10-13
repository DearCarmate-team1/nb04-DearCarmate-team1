import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';
import authRoute from './routes/auth-route.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();
const port = 3001;

app.use(express.json());

app.use('/companies', companyRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);

// 에러 핸들러 미들웨어는 가장 마지막에 등록
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
