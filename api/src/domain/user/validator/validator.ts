import { z } from 'zod';

// Schema para validar parâmetros de rota (ex: /users/:id)
export const UserParamsSchema = z.object({
    id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID deve ser um UUID válido')
});

// Schema para query parameters (ex: ?page=1&limit=10)
export const UserQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});

// Schema para login
export const LoginSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email deve ter um formato válido'),
    password: z.string().min(1, 'Senha é obrigatória')
});

// Schema para resetar senha
export const ResetPasswordSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email deve ter um formato válido')
});

// Schema para alterar senha
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string()
        .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
        .max(100, 'Nova senha deve ter no máximo 100 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});

// Tipos derivados
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

// Função utilitária para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
            return { success: false, error: errorMessage };
        }
        return { success: false, error: 'Erro de validação desconhecido' };
    }
}
