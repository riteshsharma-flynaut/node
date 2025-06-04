import { User } from "@prisma/client";

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            id: string;
            startTime: number;
            user?: User;
        }
    }
}

export {};

