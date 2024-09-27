import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  updateUserRole,
  getAllUsers
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);

userRouter.route("/get-all").get(verifyJWT,getAllUsers);

userRouter.route("/").get(verifyJWT, getUser);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/update-role").post(verifyJWT, updateUserRole);

userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default userRouter;
