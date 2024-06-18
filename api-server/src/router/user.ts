import { NextFunction, Request, Response, Router } from "express";
import { getAllUsers, getLoggedInUser } from "../controller/user";
import { errorResponse } from "../utils/responses";

const userRouter = Router();

userRouter.get("/all", getAllUsers);
userRouter.get("/me", getLoggedInUser);

userRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    errorResponse(req, res, "User Router Error" + err.message, 500);
  }
);

export default userRouter;
