import express from 'express';
import cors from 'cors';

import companyRoute from './routes/company-route.js';

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


