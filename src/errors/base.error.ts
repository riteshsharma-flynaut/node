export abstract class BaseError extends Error {
    public readonly name: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
    public readonly path?: string;
    public readonly method?: string;

    constructor(name: string, statusCode: number, description: string, isOperational: boolean = true, path?: string, method?: string) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.path = path;
        this.method = method;

        Error.captureStackTrace(this);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            path: this.path,
            method: this.method,
            stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
        };
    }
}
