import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email deve ter um formato válido'),
    password: z.string()
        .min(1, 'Senha é obrigatória')
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string()
        .min(1, 'Refresh token é obrigatório')
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export function validateAuthData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
} {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues.map(e => e.message).join(', ')
            };
        }
        return { success: false, error: 'Erro de validação' };
    }
}


export const RegisterSchema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    email: z.string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email deve ter um formato válido')
        .max(255, 'Email deve ter no máximo 255 caracteres'),
    password: z.string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .max(100, 'Senha deve ter no máximo 100 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export function validateRegisterData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
} {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues.map(e => e.message).join(', ')
            };
        }
        return { success: false, error: 'Erro de validação' };
    }
}
