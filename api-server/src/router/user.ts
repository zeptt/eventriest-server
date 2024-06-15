import { Router } from "express";
import { getAllUsers, getLoggedInUser } from "../controller/user";

export const userRouter = Router();

userRouter.get("/all", getAllUsers);
userRouter.get("/me", getLoggedInUser);