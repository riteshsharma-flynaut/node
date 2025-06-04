import winston from "winston";
import path from "path";

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), json()),
    defaultMeta: {
        service: "nodejs-api",
        version: process.env.npm_package_version || "1.0.0",
    },
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: combine(timestamp(), errors({ stack: true }), json()),
        }),

        // Combined logs
        new winston.transports.File({
            filename: path.join(logsDir, "combined.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: combine(timestamp(), json()),
        }),

        // Success/Info logs
        new winston.transports.File({
            filename: path.join(logsDir, "success.log"),
            level: "info",
            maxsize: 5242880, // 5MB
            maxFiles: 3,
            format: combine(timestamp(), json()),
        }),
    ],

    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "exceptions.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 3,
        }),
    ],

    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "rejections.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 3,
        }),
    ],
});

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: combine(colorize(), consoleFormat),
        })
    );
}

export default logger;
