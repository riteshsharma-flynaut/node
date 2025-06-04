import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { connectDatabase, disconnectDatabase } from "./config/db.config";
import { serverEnv } from "./config/env.config";
import logger from "./config/logger.config";
import mainRouter from "./modules/main.routes";
import { globalErrorHandler, notFoundHandler, uncaughtExceptionHandler, unhandledRejectionHandler } from "./errors/errorhandler.error";
import { RateLimitError } from "./errors/api.error";

// Create Express app
const app: Application = express();

// Security middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    })
);

// CORS configuration
app.use(
    cors({
        origin: "*", // Allow all origins for development, change in production
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

// Body parsing middleware
app.use(
    express.json({
        limit: "10mb",
        type: ["application/json", "application/json; charset=utf-8"],
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// Request logging middleware
app.use(
    morgan("combined", {
        stream: {
            write: (message: string) => {
                logger.info(message.trim());
            },
        },
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const error = new RateLimitError("Too many requests, please try again later.", req.path, req.method);
        res.status(429).json({
            success: false,
            error: {
                name: error.name,
                message: error.message,
                timestamp: error.timestamp,
                path: req.path,
                method: req.method,
            },
        });
    },
});
app.use(limiter);

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).id = Math.random().toString(36).slice(2, 11);
    res.setHeader("X-Request-ID", req.id);
    next();
});

// Request timing middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).startTime = Date.now();
    next();
});

// API routes
app.use("/api/v1", mainRouter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || "development",
    });
});

// API documentation endpoint
app.get("/api", (req, res) => {
    res.json({
        name: "Node.js API",
        version: "1.0.0",
        description: "Node.js API",
        endpoints: {
            users: "/api/v1/users",
            health: "/health",
        },
        documentation: "Visit /api/docs for detailed API documentation",
    });
});

// 404 handler
app.use(notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", unhandledRejectionHandler);
// Handle uncaught exceptions
process.on("uncaughtException", uncaughtExceptionHandler);

const PORT = Number(serverEnv.port) || 3000;
const HOST = serverEnv.host || "127.0.0.1";

let server: any;

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();
        server = app.listen(PORT, HOST, () => {
            logger.info(`Server running on http://${HOST}:${PORT}`);
            // logger.info(`Health check: http://${HOST}:${PORT}/health`);
            // logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
            // logger.info(`Started at: ${new Date().toISOString()}`);
        });

        server.on("error", (error: any) => {
            if (error.syscall !== "listen") {
                throw error;
            }

            const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

            switch (error.code) {
                case "EACCES":
                    logger.error(bind + " requires elevated privileges");
                    process.exit(1);
                    break;
                case "EADDRINUSE":
                    logger.error(bind + " is already in use");
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

//shutdown function
const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    const shutdownTimeout = setTimeout(() => {
        logger.error("Shutdown timeout reached. Forcing exit...");
        process.exit(1);
    }, 60000); // 60 seconds timeout

    try {
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server.close((error: any) => {
                    if (error) {
                        logger.error("Error closing server:", error);
                        reject(error);
                    } else {
                        logger.info("HTTP server closed");
                        resolve();
                    }
                });
            });
        }

        await disconnectDatabase();

        clearTimeout(shutdownTimeout);
        logger.info("Graceful shutdown completed");
        process.exit(0);
    } catch (error) {
        clearTimeout(shutdownTimeout);
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
    }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception:", error);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
});

startServer().catch((err) => {
    console.error("Fatal error starting server:", err);
    process.exit(1);
});
