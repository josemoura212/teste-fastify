import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

declare global {
    var __PRISMA__: PrismaClient | undefined;
}

declare const global: typeof globalThis;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test_db'
        }
    }
});

if (process.env.NODE_ENV !== 'production') {
    global.__PRISMA__ = prisma;
}

export { prisma };
