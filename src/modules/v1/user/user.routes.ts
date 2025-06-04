// routes for user module api
import { Router } from "express";
import { UserController } from "./controllers/user.controller";
// import { createUserValidation, updateUserValidation, idValidation } from "./validation/user.validation.js";
import { validate } from "../../../middleware/validation.middleware";
import { createUserValidation, idValidation, updateUserValidation } from "./validation/user.validation";

const userRouter = Router();
const userController = new UserController();

// User routes with validation
userRouter.post("/", validate(createUserValidation), userController.createUser);

userRouter.get("/", userController.getAllUsers);

userRouter.get("/:id", validate(idValidation), userController.getUserById);

userRouter.put("/:id", validate([...idValidation, ...updateUserValidation]), userController.updateUser);

userRouter.delete("/:id", validate(idValidation), userController.deleteUser);

export default userRouter;
