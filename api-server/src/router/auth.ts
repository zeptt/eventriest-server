import { NextFunction, Request, Response, Router } from "express";
import { login, logout, register } from "../controller/login";
import { errorResponse } from "../utils/responses";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);

authRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    errorResponse(req, res, "Auth Router Error" + err.message, 500);
  }
);

export default authRouter;
