import { Router } from "express";
import { PostController } from "./controllers/post.controller";
import { validate } from "../../../middleware/validation.middleware";
import { createPostValidation, updatePostValidation, postIdValidation, authorIdValidation } from "./validation/post.validation";

const postRouter = Router();
const postController = new PostController();

// Post routes with validation
postRouter.post("/", validate(createPostValidation), postController.createPost);

postRouter.get("/", postController.getAllPosts);

postRouter.get("/:id", validate(postIdValidation), postController.getPostById);

postRouter.get("/author/:authorId", validate(authorIdValidation), postController.getPostsByAuthor);

postRouter.put("/:id", validate([...postIdValidation, ...updatePostValidation]), postController.updatePost);

postRouter.delete("/:id", validate(postIdValidation), postController.deletePost);

export default postRouter;
