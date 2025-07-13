export interface CreateUserData {
    email: string;
    name: string;
    password: string;
}

export interface UpdateUserData {
    email?: string;
    name?: string;
    password?: string;
}

export class UserModel {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: {
        id: string;
        email: string;
        name: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.password = data.password;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toJson() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    update(data: UpdateUserData): void {
        if (data.email !== undefined) this.email = data.email;
        if (data.name !== undefined) this.name = data.name;
        if (data.password !== undefined) this.password = data.password;
        this.updatedAt = new Date();
    }

    static fromPrisma(prismaUser: any): UserModel {
        return new UserModel({
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            password: prismaUser.password,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt
        });
    }
}

export default UserModel;