import { FastifyInstance } from 'fastify';
import { UpdateUserSchema } from '../../../domain/user/entity/user';
import { UserRepository } from '../../user/repository/prisma/user.repository';
import { getPrismaClient } from '../../database/prisma-client';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateData } from '../../../domain/user/validator/validator';

export async function userRoutes(fastify: FastifyInstance) {
    const prisma = getPrismaClient();
    const userRepository = new UserRepository(prisma);

    fastify.get('/user', {
        preHandler: authMiddleware
    }, async (request: AuthenticatedRequest, reply) => {
        try {
            const user = await userRepository.findById(request.user!.id);

            if (!user) {
                return reply.status(404).send({
                    error: 'Usuário não encontrado'
                });
            }

            return reply.send({
                user: user.toJSON()
            });
        } catch (error) {
            return reply.status(500).send({
                error: 'Erro interno do servidor'
            });
        }
    });

    fastify.put('/user', {
        preHandler: authMiddleware
    }, async (request: AuthenticatedRequest, reply) => {
        const bodyValidation = validateData(UpdateUserSchema, request.body);

        if (!bodyValidation.success) {
            return reply.status(400).send({
                error: 'Dados inválidos',
                message: bodyValidation.error
            });
        }

        try {
            const user = await userRepository.update(request.user!.id, bodyValidation.data);

            if (!user) {
                return reply.status(404).send({
                    error: 'Usuário não encontrado'
                });
            }

            return reply.send({
                message: 'Usuário atualizado com sucesso',
                user: user.toJSON()
            });
        } catch (error) {
            return reply.status(500).send({
                error: 'Erro interno do servidor'
            });
        }
    });

    fastify.delete('/user', {
        preHandler: authMiddleware
    }, async (request: AuthenticatedRequest, reply) => {
        try {
            const deleted = await userRepository.delete(request.user!.id);

            if (!deleted) {
                return reply.status(404).send({
                    error: 'Usuário não encontrado'
                });
            }

            return reply.send({
                message: 'Usuário removido com sucesso'
            });
        } catch (error) {
            return reply.status(500).send({
                error: 'Erro interno do servidor'
            });
        }
    });
}
