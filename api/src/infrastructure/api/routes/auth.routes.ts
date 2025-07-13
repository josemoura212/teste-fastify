import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { RegisterRepository } from '../../user/register/prisma/register.repository';
import { getPrismaClient } from '../../database/prisma-client';
import { LoginRepository } from '../../user/login/prisma/login.repository';
import { LoginSchema, RefreshTokenSchema, RegisterSchema, validateAuthData, validateRegisterData } from '../../../domain/auth/validator';

export async function authRoutes(fastify: FastifyInstance) {
    const prisma = getPrismaClient();
    const registerRepository = new RegisterRepository(prisma);
    const loginRepository = new LoginRepository(prisma);


    fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
        const validation = validateRegisterData(RegisterSchema, request.body);

        if (!validation.success) {
            return reply.status(400).send({
                error: 'Dados inválidos',
                message: validation.error
            });
        }

        try {
            const user = await registerRepository.register(validation.data!);
            return reply.status(201).send({
                message: 'Usuário cadastrado com sucesso',
                user: user.toJSON()
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Email já está em uso') {
                return reply.status(409).send({
                    error: 'Conflito',
                    message: error.message
                });
            }

            return reply.status(500).send({
                error: 'Erro interno do servidor',
                message: 'Não foi possível cadastrar o usuário'
            });
        }
    });


    fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
        const validation = validateAuthData(LoginSchema, request.body);

        if (!validation.success) {
            return reply.status(400).send({
                error: 'Dados inválidos',
                message: validation.error
            });
        }

        try {
            const tokens = await loginRepository.login(validation.data!);

            return reply.send({
                message: 'Login realizado com sucesso',
                ...tokens
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Credenciais inválidas') {
                return reply.status(401).send({
                    error: 'Credenciais inválidas'
                });
            }

            return reply.status(500).send({
                error: 'Erro interno do servidor',
                message: 'Não foi possível realizar o login'
            });
        }
    });

    fastify.post('/auth/refresh-token', async (request: FastifyRequest, reply: FastifyReply) => {
        const validation = validateAuthData(RefreshTokenSchema, request.body);

        if (!validation.success) {
            return reply.status(400).send({
                error: 'Dados inválidos',
                message: validation.error
            });
        }

        try {
            const tokens = await loginRepository.refreshToken(validation.data!.refreshToken);

            return reply.send({
                message: 'Token renovado com sucesso',
                ...tokens
            });
        } catch (error) {
            return reply.status(401).send({
                error: 'Refresh token inválido ou expirado'
            });
        }
    });
}

export async function loginRoutes(fastify: FastifyInstance) {
    const prisma = getPrismaClient();


}
