import express from 'express';
import companyRoute from './routes/company-route.js';

const app = express();
const port = 3001;

app.use('/companies', companyRoute);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
