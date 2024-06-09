import { Router } from "express";
import { loginSchema, registerSchema } from "../schema/auth";
import bcrypt from "bcrypt";
import { db } from "../db";
import { errorResponse, successResponse } from "../utils/responses";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, "Invalid password", 400);
    }

    // save session

    req.session.user = { id: user.id, email: user.email, name: user.name };

    successResponse(res, "Logged in successfully", {
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e: any) {
    errorResponse(res, e.message, 500);
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { name, password, email } = registerSchema.parse(req.body);

    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return errorResponse(res, "User already exists", 400);
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    // save session

    req.session.user = { id: user.id, email: user.email, name: user.name };

    successResponse(
      res,
      "User created successfully",
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      201
    );
  } catch (e: any) {
    errorResponse(res, e.message, 500);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return errorResponse(res, "Failed to logout", 500);
      }

      successResponse(res, "Logged out successfully", {}, 200);
    });
  } catch (e: any) {
    errorResponse(res, e.message, 500);
  }
});

export default authRouter;
