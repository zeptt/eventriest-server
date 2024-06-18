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
    return successResponse(res, "Users fetched successfully", users);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const user = req.session.user;

    if (!user) {
      return errorResponse(req, res, "User not found", 404);
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
        announcements: true,
        events: true,
        tickets: true,
        TicketPurchase: true,
        Attendee: true,
        Subscription: true,
        tips: true,
        _count: {
          select: {
            events: true,
            tickets: true,
            TicketPurchase: true,
            Attendee: true,
            Subscription: true,
            tips: true,
          },
        },
      },
    });

    if (!userFromDB) {
      return errorResponse(req, res, "User not found", 404);
    }

    return successResponse(res, "User fetched successfully", userFromDB);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

export { getAllUsers, getLoggedInUser };
