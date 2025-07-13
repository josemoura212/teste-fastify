import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from './validator';

export class JWTService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExpiresIn: number;
    private readonly refreshTokenExpiresIn: number;

    constructor() {
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
        // 15 minutos em segundos = 15 * 60 = 900
        this.accessTokenExpiresIn = Number(process.env.JWT_ACCESS_EXPIRES_IN) || 900;
        // 7 dias em segundos = 7 * 24 * 60 * 60 = 604800
        this.refreshTokenExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN) || 604800;
    }

    generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>): AuthTokens {
        const accessTokenOptions: SignOptions = {
            expiresIn: this.accessTokenExpiresIn
        };

        const refreshTokenOptions: SignOptions = {
            expiresIn: this.refreshTokenExpiresIn
        };

        const accessToken = jwt.sign(payload, this.accessTokenSecret, accessTokenOptions);
        const refreshToken = jwt.sign(payload, this.refreshTokenSecret, refreshTokenOptions);

        // Retornar o tempo de expiração em segundos
        const expiresIn = this.accessTokenExpiresIn;

        return {
            accessToken,
            refreshToken,
            expiresIn
        };
    }

    verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
        } catch (error) {
            throw new Error('Token de acesso inválido');
        }
    }

    verifyRefreshToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
        } catch (error) {
            throw new Error('Refresh token inválido');
        }
    }

    refreshAccessToken(refreshToken: string): AuthTokens {
        try {
            const payload = this.verifyRefreshToken(refreshToken);

            // Remover campos do JWT para gerar novos tokens
            const { iat, exp, ...userPayload } = payload;

            return this.generateTokens(userPayload);
        } catch (error) {
            throw new Error('Não foi possível renovar o token');
        }
    }
}
