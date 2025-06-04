import { Router } from "express";
import userRouter from "./v1/user/user.routes";
import postRouter from "./v1/post/post.routes";

const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/post", postRouter);

// Health check route
mainRouter.get("/health", (req, res) => {
    res.json({
        message: "API v1 is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

export default mainRouter;
