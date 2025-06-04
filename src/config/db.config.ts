import { PrismaClient } from "@prisma/client";
import logger from "./logger.config";

// Create Prisma client with error handling
const prisma = new PrismaClient({
    log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
    ],
    errorFormat: "pretty",
});

// Log database queries in development
if (process.env.NODE_ENV === "development") {
    prisma.$on("query", (e: any) => {
        logger.info("Query: " + e.query);
        logger.info("Params: " + e.params);
        logger.info("Duration: " + e.duration + "ms");
    });
}

// Log database errors
prisma.$on("error", (e: any) => {
    logger.error("Database Error:", e);
});

prisma.$on("info", (e: any) => {
    logger.info("Database Info:", e);
});

prisma.$on("warn", (e: any) => {
    logger.warn("Database Warning:", e);
});

// Test database connection
export const connectDatabase = async (): Promise<void> => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully");
    } catch (error: any) {
        logger.error("Database connection failed:", error);
        throw error;
    }
};

//shutdown
export const disconnectDatabase = async (): Promise<void> => {
    try {
        await prisma.$disconnect();
        logger.info("Database disconnected successfully");
    } catch (error) {
        logger.error("Error disconnecting from database:", error);
    }
};

export default prisma;
