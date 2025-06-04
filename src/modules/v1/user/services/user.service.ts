// service for user module
// handle business logic and data manipulation and db interactions
import bcrypt from "bcryptjs";
import prisma from "../../../../config/db.config";
import logger from "../../../../config/logger.config";
import { PrismaErrorHandler } from "../../../../errors/db.error";
import { ConflictError, NotFoundError } from "../../../../errors/api.error";
import { CreateUserRequest, IUserService, UpdateUserRequest, UserResponse } from "../interfaces/user.interface";
import { User } from "@prisma/client";
export class UserService implements IUserService {
    // Map Prisma User to UserResponse DTO
    private mapUserToResponse(user: any): UserResponse {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async createUser(userData: CreateUserRequest): Promise<UserResponse> {
        try {
            // Check if user with this email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (existingUser) {
                throw new ConflictError("User with this email already exists");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, 12);

            // Create the user
            const user = await prisma.user.create({
                data: {
                    ...userData,
                    password: hashedPassword,
                },
            });

            logger.info(`User created successfully`, { userId: user.id, email: user.email });
            return this.mapUserToResponse(user);
        } catch (error: any) {
            logger.error("Error creating user:", { error: error.message, email: userData.email });

            if (error instanceof ConflictError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getUserById(id: string): Promise<UserResponse | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                throw new NotFoundError("User");
            }

            return this.mapUserToResponse(user);
        } catch (error: any) {
            logger.error(`Error fetching user by ID ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getUserByEmail(email: string): Promise<UserResponse | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            return user ? this.mapUserToResponse(user) : null;
        } catch (error: any) {
            logger.error(`Error fetching user by email ${email}:`, error.message);
            throw PrismaErrorHandler.handle(error);
        }
    }

    async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse | null> {
        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundError("User");
            }

            // Update the user
            const updatedUser = await prisma.user.update({
                where: { id },
                data: userData,
            });

            logger.info(`User updated successfully`, { userId: id });
            return this.mapUserToResponse(updatedUser);
        } catch (error: any) {
            logger.error(`Error updating user ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundError("User");
            }

            // Delete the user
            await prisma.user.delete({
                where: { id },
            });

            logger.info(`User deleted successfully`, { userId: id });
            return true;
        } catch (error: any) {
            logger.error(`Error deleting user ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getAllUsers(
        page: number = 1,
        limit: number = 10
    ): Promise<{
        users: UserResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * limit;

            // Get users with pagination
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.user.count(),
            ]);

            const userResponses = users.map((user: User) => this.mapUserToResponse(user));

            return {
                users: userResponses,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error: any) {
            logger.error("Error fetching all users:", error.message);
            throw PrismaErrorHandler.handle(error);
        }
    }
}
