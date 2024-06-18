import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schema/auth";
import { db } from "../db";
import { errorResponse, successResponse } from "../utils/responses";
import bcrypt from "bcrypt";
import { SendEmail } from "../utils/email-service";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return errorResponse(req, res, "Invalid password", 400);
    }

    // save session

    req.session.user = { id: user.id, email: user.email, name: user.name };

    return successResponse(res, "Logged in successfully", {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const { name, password, email, username } = registerSchema.parse(req.body);

    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return errorResponse(req, res, "User already exists", 400);
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        username,
        password: passwordHash,
      },
    });

    // save session

    req.session.user = { id: user.id, email: user.email, name: user.name };

    // Send Invitation Email

    const emailPayload = {
      to: email,
      subject: "Welcome to our platform",
      body: `<h1>Welcome to our platform</h1>
          <p>Hi ${name},</p>
          <p>Thank you for registering on our platform. Your Username is ${username}</p>
          <p>Best Regards,</p>
          <p>Team</p>`,
      name,
      cc: "",
      bcc: "",
    };

    const emailResponse = await SendEmail(emailPayload);

    if (emailResponse.success) {
      return successResponse(res, "User created successfully", {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      });
    } else {
      return errorResponse(req, res, emailResponse.message, 500);
    }
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return errorResponse(req, res, "Failed to logout", 500);
      }

      return successResponse(
        res,
        "Logged out successfully",
        {
          message: "Logged out successfully",
        },
        200
      );
    });
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

export { login, register, logout };
