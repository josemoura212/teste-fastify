import { PrismaClient } from '@prisma/client';
import User from '../../../../domain/user/entity/user';
import { UserFactory } from '../../../../domain/user/factory/user.factory';
import { RegisterInput } from '../../../../domain/auth/validator';

export class RegisterRepository {
    constructor(private prisma: PrismaClient) { }

    async register(data: RegisterInput): Promise<User> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('Email já está em uso');
        }

        try {
            const now = new Date();
            const user = new User(data.name, data.email, data.password, now, now);

            const userData = await this.prisma.user.create({
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.passwordHash,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });

            return UserFactory.fromDatabase({
                ...userData,
                passwordHash: userData.password
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw new Error('Erro ao cadastrar usuário');
        }
    }
}
