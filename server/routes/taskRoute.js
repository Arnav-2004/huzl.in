import express from "express";
import {
  createTask,
  getTasks,
  trashTask,
  deleteRestoreTask,
  updateTask,
  createSubTask,
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.js";

const taskRouter = express.Router();

taskRouter.post("/create", authMiddleware, createTask);
taskRouter.get("/tasks", authMiddleware, getTasks);
taskRouter.delete("/trash/:id", authMiddleware, trashTask);
taskRouter.delete("/delete-restore/:id?", authMiddleware, deleteRestoreTask);
taskRouter.put("/update/:id", authMiddleware, updateTask);
taskRouter.put("/create-subtask/:id", authMiddleware, createSubTask);

export default taskRouter;
