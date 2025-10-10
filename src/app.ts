import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


