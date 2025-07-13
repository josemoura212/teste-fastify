import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import Entity from '../../@shared/entity/entity.abstract';

export const CreateUserSchema = z.object({
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

export const UpdateUserSchema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
        .optional(),
    email: z.string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email deve ter um formato válido')
        .max(255, 'Email deve ter no máximo 255 caracteres')
        .optional(),
    password: z.string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .max(100, 'Senha deve ter no máximo 100 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
        .optional()
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

export default class User extends Entity {
    private _name: string;
    private _email: string;
    private _password: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private static readonly SALT_ROUNDS = 12;

    constructor(name: string, email: string, password: string, createdAt: Date, updatedAt: Date, id?: string) {
        super(id);
        
        const isHashedPassword = password.startsWith('$2b$') || password.startsWith('$2a$');
        
        if (!isHashedPassword) {
            const validatedData = CreateUserSchema.parse({ name, email, password });
            this._name = validatedData.name;
            this._email = validatedData.email;
            this._password = this.hashPassword(validatedData.password);
        } else {
            this._name = name;
            this._email = email;
            this._password = password;
        }

        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    private hashPassword(password: string): string {
        return bcrypt.hashSync(password, User.SALT_ROUNDS);
    }

    verifyPassword(plainPassword: string): boolean {
        return bcrypt.compareSync(plainPassword, this._password);
    }

    update(data: UpdateUserData): void {
        const validatedData = UpdateUserSchema.parse(data);

        if (validatedData.name !== undefined) {
            this._name = validatedData.name;
        }
        if (validatedData.email !== undefined) {
            this._email = validatedData.email;
        }
        if (validatedData.password !== undefined) {
            this._password = this.hashPassword(validatedData.password);
        }

        this._updatedAt = new Date();
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get passwordHash(): string {
        return this._password;
    }

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            email: this._email,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }
}
