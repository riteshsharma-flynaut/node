import dotenv from "dotenv";

dotenv.config();

export const dbEnv = {
    url: process.env.DATABASE_URL,
};

export const serverEnv = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "",
    env: process.env.NODE_ENV || "development",
};
export const jwtEnv = {
    secret: process.env.JWT_SECRET,
};
