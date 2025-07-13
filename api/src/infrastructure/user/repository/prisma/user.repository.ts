import { PrismaClient } from '@prisma/client';
import UserFactory from '../../../../domain/user/factory/user.factory';
import User, { CreateUserData, UpdateUserData } from '../../../../domain/user/entity/user';

export class UserRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async create(data: CreateUserData): Promise<User> {
        const user = UserFactory.create(data);

        const savedUser = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                password: user.passwordHash,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

        return UserFactory.fromDatabase({
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            passwordHash: savedUser.password,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        });
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        return user ? UserFactory.fromDatabase({
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: user.password,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        return user ? UserFactory.fromDatabase({
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: user.password,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }) : null;
    }

    async update(id: string, data: UpdateUserData): Promise<User | null> {
        try {
            const existingUser = await this.findById(id);
            if (!existingUser) {
                return null;
            }

            existingUser.update(data);

            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    name: existingUser.name,
                    email: existingUser.email,
                    password: existingUser.passwordHash,
                    updatedAt: existingUser.updatedAt
                }
            });

            return UserFactory.fromDatabase({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                passwordHash: updatedUser.password,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            });
        } catch (error) {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default UserRepository;
