import prisma from "../../../../config/db.config";
import logger from "../../../../config/logger.config";
import { PrismaErrorHandler } from "../../../../errors/db.error";
import { NotFoundError } from "../../../../errors/api.error";
import { CreatePostRequest, IPostService, UpdatePostRequest, PostResponse } from "../interfaces/post.interface";
import { IUserService } from "../../user/interfaces/user.interface";
import { UserService } from "../../user/services/user.service";
import { Post } from "@prisma/client";

export class PostService implements IPostService {
    private userService: IUserService;

    constructor() {
        // Dependency injection - inject UserService to communicate with User module
        this.userService = new UserService();
    }

    // Map Prisma Post to PostResponse DTO
    private mapPostToResponse(post: any, includeAuthor: boolean = false): PostResponse {
        const response: PostResponse = {
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
        };

        // Include author details if available and requested
        if (includeAuthor && post.author) {
            response.author = {
                id: post.author.id,
                email: post.author.email,
                firstName: post.author.firstName,
                lastName: post.author.lastName,
            };
        }

        return response;
    }

    async createPost(postData: CreatePostRequest): Promise<PostResponse> {
        try {
            // First, verify that the author (user) exists using User module
            const author = await this.userService.getUserById(postData.authorId);
            if (!author) {
                throw new NotFoundError("Author (User)");
            }

            // Create the post
            const post = await prisma.post.create({
                data: {
                    title: postData.title,
                    content: postData.content,
                    authorId: postData.authorId,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            logger.info(`Post created successfully`, {
                postId: post.id,
                authorId: post.authorId,
                title: post.title,
            });

            return this.mapPostToResponse(post, true);
        } catch (error: any) {
            logger.error("Error creating post:", {
                error: error.message,
                authorId: postData.authorId,
                title: postData.title,
            });

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getPostById(id: string): Promise<PostResponse | null> {
        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            if (!post) {
                throw new NotFoundError("Post");
            }

            return this.mapPostToResponse(post, true);
        } catch (error: any) {
            logger.error(`Error fetching post by ID ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getPostsByAuthor(authorId: string): Promise<PostResponse[]> {
        try {
            // Verify author exists using User module
            const author = await this.userService.getUserById(authorId);
            if (!author) {
                throw new NotFoundError("Author (User)");
            }

            const posts = await prisma.post.findMany({
                where: { authorId },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            return posts.map((post) => this.mapPostToResponse(post, true));
        } catch (error: any) {
            logger.error(`Error fetching posts by author ${authorId}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async updatePost(id: string, postData: UpdatePostRequest): Promise<PostResponse | null> {
        try {
            // Check if post exists
            const existingPost = await prisma.post.findUnique({
                where: { id },
            });

            if (!existingPost) {
                throw new NotFoundError("Post");
            }

            // Update the post
            const updatedPost = await prisma.post.update({
                where: { id },
                data: postData,
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            logger.info(`Post updated successfully`, { postId: id });
            return this.mapPostToResponse(updatedPost, true);
        } catch (error: any) {
            logger.error(`Error updating post ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async deletePost(id: string): Promise<boolean> {
        try {
            // Check if post exists
            const existingPost = await prisma.post.findUnique({
                where: { id },
            });

            if (!existingPost) {
                throw new NotFoundError("Post");
            }

            // Delete the post
            await prisma.post.delete({
                where: { id },
            });

            logger.info(`Post deleted successfully`, { postId: id });
            return true;
        } catch (error: any) {
            logger.error(`Error deleting post ${id}:`, error.message);

            if (error instanceof NotFoundError) {
                throw error;
            }

            throw PrismaErrorHandler.handle(error);
        }
    }

    async getAllPosts(
        page: number = 1,
        limit: number = 10
    ): Promise<{
        posts: PostResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * limit;

            // Get posts with pagination
            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    skip,
                    take: limit,
                    include: {
                        author: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.post.count(),
            ]);

            const postResponses = posts.map((post: any) => this.mapPostToResponse(post, true));

            return {
                posts: postResponses,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error: any) {
            logger.error("Error fetching all posts:", error.message);
            throw PrismaErrorHandler.handle(error);
        }
    }
}
