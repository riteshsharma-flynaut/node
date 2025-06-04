// validation for user module
// handle input validation and sanitization use express-validator or any other library as per your convention
import { body, param, query } from "express-validator";

export const createUserValidation = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage("Email must not exceed 255 characters"),

    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),

    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("First name can only contain letters and spaces"),

    body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),

    body("phone").optional().isMobilePhone("any").withMessage("Please provide a valid phone number"),
];

export const updateUserValidation = [
    body("firstName")
        .optional()
        .notEmpty()
        .withMessage("First name cannot be empty if provided")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("First name can only contain letters and spaces"),

    body("lastName")
        .optional()
        .notEmpty()
        .withMessage("Last name cannot be empty if provided")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),

    body("phone").optional().isMobilePhone("any").withMessage("Please provide a valid phone number"),

    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean value"),
];

export const idValidation = [param("id").isUUID().withMessage("Please provide a valid user ID (UUID format)")];

export const paginationValidation = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
