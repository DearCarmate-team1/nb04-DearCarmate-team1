import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from './constants.js';

const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export default prisma;
