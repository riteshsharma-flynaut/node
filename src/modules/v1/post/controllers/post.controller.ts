import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/post.service";
import { ErrorHandler } from "../../../../errors/errorhandler.error";
import { ResponseUtil } from "../../../../utils/response.util";
import { CreatePostRequest, UpdatePostRequest } from "../interfaces/post.interface";

export class PostController {
    private postService: PostService;

    constructor() {
        this.postService = new PostService();
    }

    createPost = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const postData: CreatePostRequest = req.body;
        const post = await this.postService.createPost(postData);

        ResponseUtil.created(res, post, "Post created successfully");
    });

    getPostById = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const post = await this.postService.getPostById(id);

        ResponseUtil.success(res, post);
    });

    getPostsByAuthor = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { authorId } = req.params;
        const posts = await this.postService.getPostsByAuthor(authorId);

        ResponseUtil.success(res, posts, "Posts fetched successfully");
    });

    getAllPosts = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.postService.getAllPosts(page, limit);

        ResponseUtil.success(res, result.posts, "Posts fetched successfully", 200, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        });
    });

    updatePost = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const postData: UpdatePostRequest = req.body;
        const updatedPost = await this.postService.updatePost(id, postData);

        ResponseUtil.success(res, updatedPost, "Post updated successfully");
    });

    deletePost = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        await this.postService.deletePost(id);

        ResponseUtil.noContent(res, "Post deleted successfully");
    });
}
