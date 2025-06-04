import { Response } from "express";

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    timestamp: string;
}

export class ResponseUtil {
    static success<T>(res: Response, data: T, message?: string, statusCode: number = 200, pagination?: SuccessResponse["pagination"]): void {
        const response: SuccessResponse<T> = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
            ...(pagination && { pagination }),
        };

        res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T, message: string = "Resource created successfully"): void {
        this.success(res, data, message, 201);
    }

    static noContent(res: Response, message: string = "Operation completed successfully"): void {
        res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
