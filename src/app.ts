import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import companyRoute from './routes/company-route.js';
import userRoute from './routes/user-route.js';

const app = express();
const port = 3001;

app.use(express.json());

app.use('/companies', companyRoute);
app.use('/users', userRoute);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
