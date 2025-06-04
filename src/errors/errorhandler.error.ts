import { Request, Response, NextFunction } from "express";
import { BaseError } from "./base.error";
import { ApiError, ValidationError } from "./api.error";
import { DatabaseError, PrismaErrorHandler } from "./db.error";
import logger from "../config/logger.config";

export class ErrorHandler {
    public static handleError(error: Error | BaseError, req?: Request): BaseError {
        if (error instanceof BaseError) {
            return error;
        }
        if (
            error.name === "PrismaClientKnownRequestError" ||
            error.name === "PrismaClientValidationError" ||
            error.name === "PrismaClientInitializationError"
        ) {
            return PrismaErrorHandler.handle(error, req?.path, req?.method);
        }

        if (error.name === "ValidationError") {
            return new ValidationError(error.message, undefined, undefined, req?.path, req?.method);
        }

        if (error.message.includes("not found")) {
            return new ApiError(error.message, 404, req?.path, req?.method);
        }

        if (error.message.includes("already exists")) {
            return new ApiError(error.message, 409, req?.path, req?.method);
        }

        return new ApiError(process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message, 500, req?.path, req?.method);
    }

    public static isTrustedError(error: Error): boolean {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }

    public static logError(error: Error | BaseError, req?: Request): void {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            url: req?.url,
            method: req?.method,
            ip: req?.ip,
            userAgent: req?.get("User-Agent"),
            timestamp: new Date().toISOString(),
            ...(error instanceof BaseError && error.toJSON()),
        };

        if (error instanceof BaseError && error.statusCode < 500) {
            logger.warn("Client Error:", errorInfo);
        } else {
            logger.error("Server Error:", errorInfo);
        }
    }

    public static handleAsyncError = (fn: Function) => {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    };
}

export const globalErrorHandler = (error: Error | BaseError, req: Request, res: Response, next: NextFunction): void => {
    const processedError = ErrorHandler.handleError(error, req);
    ErrorHandler.logError(processedError, req);

    res.status(processedError.statusCode).json({
        success: false,
        error: {
            name: processedError.name,
            message: processedError.message,
            timestamp: processedError.timestamp,
            path: req.path,
            method: req.method,
            ...(process.env.NODE_ENV === "development" && {
                stack: processedError.stack,
            }),
        },
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    const error = new ApiError(`Route ${req.originalUrl} not found`, 404, req.path, req.method);
    res.status(404).json({
        success: false,
        error: {
            name: error.name,
            message: error.message,
            timestamp: error.timestamp,
            path: req.path,
            method: req.method,
        },
    });
};

// Unhandled promise rejection handler
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    throw reason;
};

// Uncaught exception handler
export const uncaughtExceptionHandler = (error: Error): void => {
    logger.error("Uncaught Exception:", error);

    //shutdown
    process.exit(1);
};
