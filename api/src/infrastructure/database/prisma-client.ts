import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    return prisma;
}

export async function connectDatabase(): Promise<void> {
    try {
        const client = getPrismaClient();
        await client.$connect();
        console.log('✅ Conectado ao banco de dados PostgreSQL');
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    try {
        if (prisma) {
            await prisma.$disconnect();
            console.log('💀 Desconectado do banco de dados');
        }
    } catch (error) {
        console.error('❌ Erro ao desconectar do banco de dados:', error);
    }
}

export { prisma };
