// controller for user module
// handle only request and response
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { ErrorHandler } from "../../../../errors/errorhandler.error";
import { ResponseUtil } from "../../../../utils/response.util";
import { CreateUserRequest, UpdateUserRequest } from "../interfaces/user.interface";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    createUser = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userData: CreateUserRequest = req.body;
        const user = await this.userService.createUser(userData);

        ResponseUtil.created(res, user, "User created successfully");
    });

    getUserById = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const user = await this.userService.getUserById(id);

        ResponseUtil.success(res, user);
    });

    getAllUsers = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this.userService.getAllUsers(page, limit);

        ResponseUtil.success(res, result.users, "Users fetched successfully", 200, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        });
    });

    updateUser = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const userData: UpdateUserRequest = req.body;
        const updatedUser = await this.userService.updateUser(id, userData);

        ResponseUtil.success(res, updatedUser, "User updated successfully");
    });

    deleteUser = ErrorHandler.handleAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        await this.userService.deleteUser(id);

        ResponseUtil.noContent(res, "User deleted successfully");
    });
}
