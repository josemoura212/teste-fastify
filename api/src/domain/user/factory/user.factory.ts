import User, { CreateUserData } from '../entity/user';

export class UserFactory {

    static create(data: CreateUserData): User {
        const now = new Date();
        return new User(
            data.name,
            data.email,
            data.password,
            now,
            now
        );
    }

    static fromDatabase(data: {
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }): User {
        return new User(
            data.name,
            data.email,
            data.passwordHash,
            data.createdAt,
            data.updatedAt,
            data.id
        );
    }
}

export default UserFactory;
