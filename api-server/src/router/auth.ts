import { NextFunction, Request, Response, Router } from "express";
import { login, logout, register } from "../controller/login";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);

authRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: "AuthRouter Error", message: err.message });
});

export default authRouter;
