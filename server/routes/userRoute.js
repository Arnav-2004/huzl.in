import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getUsers,
  getUserById,
  getTeamList,
  deleteUserProfile,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/users", getUsers);
userRouter.get("/user/:id", getUserById);
userRouter.get("/team", getTeamList);
userRouter.delete("/user/:id", deleteUserProfile);

export default userRouter;
