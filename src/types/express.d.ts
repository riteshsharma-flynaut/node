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

// import { User } from "../generated/prisma";
// import "express-serve-static-core";

// declare module "express-serve-static-core" {
//     interface Request {
//         id: string;
//         startTime: number;
//         user?: User;
//     }
// }

// export {};
