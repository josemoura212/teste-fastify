import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginRepository } from '../user/login/prisma/login.repository';
import { getPrismaClient } from '../database/prisma-client';

export interface AuthenticatedRequest extends FastifyRequest {
    user?: {
        id: string;
        email: string;
    };
}

export async function authMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                error: 'Token de acesso não fornecido'
            });
        }

        const token = authHeader.substring(7);

        const prisma = getPrismaClient();
        const loginRepository = new LoginRepository(prisma);

        const user = await loginRepository.validateAccessToken(token);

        request.user = {
            id: user.id,
            email: user.email
        };

    } catch (error) {
        return reply.status(401).send({
            error: 'Token inválido ou expirado'
        });
    }
}
