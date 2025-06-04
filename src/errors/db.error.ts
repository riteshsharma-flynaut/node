import { BaseError } from "./base.error";

export class DatabaseError extends BaseError {
    public readonly code?: string;
    public readonly constraint?: string;

    constructor(message: string, code?: string, constraint?: string, path?: string, method?: string) {
        super("DatabaseError", 500, message, true, path, method);
        this.code = code;
        this.constraint = constraint;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            code: this.code,
            constraint: this.constraint,
        };
    }
}

export class PrismaErrorHandler {
    static handle(error: any, path?: string, method?: string): DatabaseError {
        // Prisma Client specific errors
        if (error.code) {
            switch (error.code) {
                case "P2002":
                    return new DatabaseError(
                        `Unique constraint violation: ${error.meta?.target?.join(", ") || "unknown field"}`,
                        error.code,
                        error.meta?.constraint_name,
                        path,
                        method
                    );
                case "P2025":
                    return new DatabaseError("Record not found", error.code, undefined, path, method);
                case "P2003":
                    return new DatabaseError("Foreign key constraint violation", error.code, error.meta?.field_name, path, method);
                case "P2014":
                    return new DatabaseError("Invalid relation reference", error.code, error.meta?.relation_name, path, method);
                case "P2021":
                    return new DatabaseError("Table does not exist", error.code, error.meta?.table, path, method);
                case "P2022":
                    return new DatabaseError("Column does not exist", error.code, error.meta?.column, path, method);
                default:
                    return new DatabaseError(error.message || "Database operation failed", error.code, undefined, path, method);
            }
        }

        // Generic database errors
        return new DatabaseError(error.message || "Database operation failed", undefined, undefined, path, method);
    }
}
