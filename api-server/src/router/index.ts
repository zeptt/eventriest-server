import { Router } from "express";
import authRouter from "./auth";
import isAuthenticated from "../middlewares/authMiddleware";

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

mainRouter.use(isAuthenticated());

mainRouter.get("/protected", (req, res) => {
  res.send(req.session.user);
});

// 404 Fallback

mainRouter.use((_, res) => {
  res.status(404).send("Route Not Found!");
});

export default mainRouter;
