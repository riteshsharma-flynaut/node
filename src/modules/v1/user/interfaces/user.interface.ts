export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserService {
    createUser(userData: CreateUserRequest): Promise<UserResponse>;
    getUserById(id: string): Promise<UserResponse | null>;
    getUserByEmail(email: string): Promise<UserResponse | null>;
    updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse | null>;
    deleteUser(id: string): Promise<boolean>;
    getAllUsers(
        page: number,
        limit: number
    ): Promise<{
        users: UserResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
