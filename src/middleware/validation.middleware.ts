import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ValidationError } from "../errors/api.error";

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Execute all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map((err) => ({
            field: err.type === "field" ? err.path : "unknown",
            message: err.msg,
            value: err.type === "field" ? err.value : undefined,
        }));

        const error = new ValidationError("Validation failed", undefined, extractedErrors, req.path, req.method);

        next(error);
    };
};
