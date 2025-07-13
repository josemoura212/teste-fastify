import request from 'supertest';
import { app } from '../src/infrastructure/api/fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication System', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'João Silva',
                email: 'joao@teste.com',
                password: 'MinhaSenh4'
            };

            const response = await request(app.server)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Usuário cadastrado com sucesso');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', userData.email);
            expect(response.body.user).toHaveProperty('name', userData.name);
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should return error for invalid email', async () => {
            const userData = {
                name: 'João Silva',
                email: 'email-invalido',
                password: 'MinhaSenh4'
            };

            const response = await request(app.server)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Dados inválidos');
        });

        it('should return error for weak password', async () => {
            const userData = {
                name: 'João Silva',
                email: 'joao@teste.com',
                password: '123'
            };

            const response = await request(app.server)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Dados inválidos');
        });

        it('should return error for duplicate email', async () => {
            const userData = {
                name: 'João Silva',
                email: 'joao@teste.com',
                password: 'MinhaSenh4'
            };

            await request(app.server)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            const response = await request(app.server)
                .post('/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body).toHaveProperty('error', 'Conflito');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app.server)
                .post('/auth/register')
                .send({
                    name: 'João Silva',
                    email: 'joao@teste.com',
                    password: 'MinhaSenh4'
                });
        });

        it('should login successfully with valid credentials', async () => {
            const loginData = {
                email: 'joao@teste.com',
                password: 'MinhaSenh4'
            };

            const response = await request(app.server)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('expiresIn');
        });

        it('should return error for invalid email', async () => {
            const loginData = {
                email: 'email@naoexiste.com',
                password: 'MinhaSenh4'
            };

            const response = await request(app.server)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
        });

        it('should return error for invalid password', async () => {
            const loginData = {
                email: 'joao@teste.com',
                password: 'SenhaErrada1'
            };

            const response = await request(app.server)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
        });
    });

    describe('POST /auth/refresh-token', () => {
        let refreshToken: string;

        beforeEach(async () => {
            await request(app.server)
                .post('/auth/register')
                .send({
                    name: 'João Silva',
                    email: 'joao@teste.com',
                    password: 'MinhaSenh4'
                });

            const loginResponse = await request(app.server)
                .post('/auth/login')
                .send({
                    email: 'joao@teste.com',
                    password: 'MinhaSenh4'
                });

            refreshToken = loginResponse.body.refreshToken;
        });

        it('should refresh token successfully', async () => {
            const response = await request(app.server)
                .post('/auth/refresh-token')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Token renovado com sucesso');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('expiresIn');
        });

        it('should return error for invalid refresh token', async () => {
            const response = await request(app.server)
                .post('/auth/refresh-token')
                .send({ refreshToken: 'token-invalido' })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Refresh token inválido ou expirado');
        });
    });

    describe('Protected Routes', () => {
        let accessToken: string;
        let userId: string;

        beforeEach(async () => {
            const registerResponse = await request(app.server)
                .post('/auth/register')
                .send({
                    name: 'João Silva',
                    email: 'joao@teste.com',
                    password: 'MinhaSenh4'
                });

            userId = registerResponse.body.user.id;

            const loginResponse = await request(app.server)
                .post('/auth/login')
                .send({
                    email: 'joao@teste.com',
                    password: 'MinhaSenh4'
                });

            accessToken = loginResponse.body.accessToken;
        });

        describe('GET /auth/user', () => {
            it('should get user data with valid token', async () => {
                const response = await request(app.server)
                    .get('/user')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(200);

                expect(response.body.user).toHaveProperty('id', userId);
                expect(response.body.user).toHaveProperty('email', 'joao@teste.com');
                expect(response.body.user).toHaveProperty('name', 'João Silva');
            });

            it('should return error without token', async () => {
                const response = await request(app.server)
                    .get('/user')
                    .expect(401);

                expect(response.body).toHaveProperty('error', 'Token de acesso não fornecido');
            });

            it('should return error with invalid token', async () => {
                const response = await request(app.server)
                    .get('/user')
                    .set('Authorization', 'Bearer token-invalido')
                    .expect(401);

                expect(response.body).toHaveProperty('error', 'Token inválido ou expirado');
            });
        });

        describe('PUT /user', () => {
            it('should update user data with valid token', async () => {
                const updateData = {
                    name: 'João Silva Santos'
                };

                const response = await request(app.server)
                    .put('/user')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body).toHaveProperty('message', 'Usuário atualizado com sucesso');
                expect(response.body.user).toHaveProperty('name', 'João Silva Santos');
            });

            it('should return error without token', async () => {
                const response = await request(app.server)
                    .put('/user')
                    .send({ name: 'Novo Nome' })
                    .expect(401);

                expect(response.body).toHaveProperty('error', 'Token de acesso não fornecido');
            });
        });

        describe('DELETE /user', () => {
            it('should delete user with valid token', async () => {
                const response = await request(app.server)
                    .delete('/user')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(200);

                expect(response.body).toHaveProperty('message', 'Usuário removido com sucesso');

                const getUserResponse = await request(app.server)
                    .get('/user')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(401);
            });
        });
    });
});
