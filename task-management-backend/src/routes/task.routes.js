import { Router } from "express";
import { createTask, updateTask, deleteTask, getTasksById,assignUserToTask, unassignUserFromTask  } from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const taskRouter = Router();

taskRouter.route("/create").post(verifyJWT, createTask);
taskRouter.route("/update/:id").patch(verifyJWT, updateTask);
taskRouter.route("/:id").get(verifyJWT, getTasksById);
taskRouter.route("/:id").delete(verifyJWT, deleteTask);
taskRouter.route("/assign/:taskId").post(verifyJWT, assignUserToTask);
taskRouter.route("/unassign/:taskId").post(verifyJWT, unassignUserFromTask);
export default taskRouter;
