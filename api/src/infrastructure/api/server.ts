import { app } from "./fastify";
import { connectDatabase, disconnectDatabase } from "../database/prisma-client";

async function start() {
    try {
        await connectDatabase();

        await app.listen({ port: 3000, host: '0.0.0.0' });

        app.log.info('🚀 Servidor rodando na porta 3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    app.log.info('Recebido SIGINT, fechando servidor...');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    app.log.info('Recebido SIGTERM, fechando servidor...');
    await disconnectDatabase();
    process.exit(0);
});

start();
