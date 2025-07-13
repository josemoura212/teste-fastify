import { PrismaClient } from '@prisma/client';
import User from '../../../../domain/user/entity/user';
import { UserFactory } from '../../../../domain/user/factory/user.factory';
import { LoginInput, AuthTokens } from '../../../../domain/auth/validator';
import { JWTService } from '../../../../domain/auth/jwt.service';

export class LoginRepository {
    private jwtService: JWTService;

    constructor(private prisma: PrismaClient) {
        this.jwtService = new JWTService();
    } async login(data: LoginInput): Promise<AuthTokens> {
        const userData = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!userData) {
            throw new Error('Credenciais inválidas');
        }

        const user = UserFactory.fromDatabase({
            ...userData,
            passwordHash: userData.password
        });

        if (!user.verifyPassword(data.password)) {
            throw new Error('Credenciais inválidas');
        }

        const tokens = this.jwtService.generateTokens({
            userId: user.id,
            email: user.email
        });

        return tokens;
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            return this.jwtService.refreshAccessToken(refreshToken);
        } catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }

    async validateAccessToken(token: string): Promise<User> {
        try {
            const payload = this.jwtService.verifyAccessToken(token);

            const userData = await this.prisma.user.findUnique({
                where: { id: payload.userId }
            });

            if (!userData) {
                throw new Error('Usuário não encontrado');
            }

            return UserFactory.fromDatabase({
                ...userData,
                passwordHash: userData.password
            });
        } catch (error) {
            throw new Error('Token inválido');
        }
    }
}
