import { BaseError } from "./base.error";

export class ApiError extends BaseError {
    constructor(message: string = "Internal Server Error", statusCode: number = 500, path?: string, method?: string) {
        super("ApiError", statusCode, message, true, path, method);
    }
}

export class ValidationError extends BaseError {
    public readonly field?: string;
    public readonly errors?: any[];

    constructor(message: string, field?: string, errors?: any[], path?: string, method?: string) {
        super("ValidationError", 400, message, true, path, method);
        this.field = field;
        this.errors = errors;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            field: this.field,
            errors: this.errors,
        };
    }
}

export class NotFoundError extends BaseError {
    constructor(resource: string = "Resource", path?: string, method?: string) {
        super("NotFoundError", 404, `${resource} not found`, true, path, method);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string = "Resource already exists", path?: string, method?: string) {
        super("ConflictError", 409, message, true, path, method);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string = "Unauthorized access", path?: string, method?: string) {
        super("UnauthorizedError", 401, message, true, path, method);
    }
}

export class ForbiddenError extends BaseError {
    constructor(message: string = "Forbidden access", path?: string, method?: string) {
        super("ForbiddenError", 403, message, true, path, method);
    }
}

export class RateLimitError extends BaseError {
    constructor(message: string = "Too many requests", path?: string, method?: string) {
        super("RateLimitError", 429, message, true, path, method);
    }
}
