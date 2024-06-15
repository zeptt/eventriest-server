import { NextFunction, Request, Response, Router } from "express";
import { getAllUsers, getLoggedInUser } from "../controller/user";

export const userRouter = Router();

userRouter.get("/all", getAllUsers);
userRouter.get("/me", getLoggedInUser);

userRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ error: "UserRouter Error", message: err.message });
  }
);
