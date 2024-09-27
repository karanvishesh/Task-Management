import { Router } from "express";
import {
  createTaskList,
  getUserTaskLists,
  getAllTaskListsForAdmin,
  getTaskListById,
  updateTaskList,
  deleteTaskList
} from "../controllers/taskList.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const taskListRouter = Router();

taskListRouter.route("/create").post(verifyJWT, createTaskList);
taskListRouter.route("/get-all").get(verifyJWT, getAllTaskListsForAdmin);
taskListRouter.route("/update/:id").patch(verifyJWT, updateTaskList);
taskListRouter.route("/").get(verifyJWT, getUserTaskLists);
taskListRouter.route("/:id").get(verifyJWT, getTaskListById);
taskListRouter.route("/:id").delete(verifyJWT, deleteTaskList);

export default taskListRouter;
