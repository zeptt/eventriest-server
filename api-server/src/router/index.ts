import { Router } from "express";
import authRouter from "./auth";
import isAuthenticated from "../middlewares/authMiddleware";
import { userRouter } from "./user";
import { eventRouter } from "./event";

const mainRouter = Router();

// Basic Routes

mainRouter.get("/", (req, res) => {
  res.send("API Server is running!");
});

mainRouter.get("/health", (_, res) => {
  res.status(200).send("ok");
});

// Configure routes here

mainRouter.use("/auth", authRouter);

// Un Protected Routes

// eg: mainRouter.use("/test", testRouter);

// Authenticated Routes

mainRouter.use("/event", eventRouter);

mainRouter.use(isAuthenticated());

mainRouter.get("/protected", (req, res) => {
  res.send(req.session.user);
});

// User Routes
mainRouter.use("/user", userRouter);

// 404 Fallback

mainRouter.use((_, res) => {
  res.status(404).send("Route Not Found!");
});

export default mainRouter;
