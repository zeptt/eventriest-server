import { Request, Response } from "express";
import { db } from "../db";
import { errorResponse, successResponse } from "../utils/responses";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    successResponse(res, "Users fetched successfully", users);
  } catch (e: any) {
    errorResponse(res, e.message, 500);
  }
};

const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const user = req.session.user;

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const userFromDB = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userFromDB) {
      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, "User fetched successfully", userFromDB);
  } catch (e: any) {
    errorResponse(res, e.message, 500);
  }
};

export { getAllUsers, getLoggedInUser };
