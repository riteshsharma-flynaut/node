import { body, param, query } from "express-validator";

export const createPostValidation = [
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage("Title must be between 3 and 200 characters"),

    body("content").optional().isLength({ max: 5000 }).withMessage("Content must not exceed 5000 characters"),

    body("authorId").isUUID().withMessage("Please provide a valid author ID (UUID format)"),
];

export const updatePostValidation = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Title cannot be empty if provided")
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage("Title must be between 3 and 200 characters"),

    body("content").optional().isLength({ max: 5000 }).withMessage("Content must not exceed 5000 characters"),
];

export const postIdValidation = [param("id").isUUID().withMessage("Please provide a valid post ID (UUID format)")];

export const authorIdValidation = [param("authorId").isUUID().withMessage("Please provide a valid author ID (UUID format)")];
