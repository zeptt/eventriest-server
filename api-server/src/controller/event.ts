import { Request, Response } from "express";
import { db } from "../db";
import { errorResponse, successResponse } from "../utils/responses";
import { eventSchema } from "../schema/event";

const getAllEvents = async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string | undefined;

    let events;
    if (username) {
      const user = await db.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        return errorResponse(req, res, "User not found", 404);
      }

      events = await db.event.findMany({
        where: {
          organizerId: user.id,
        },
      });

      if (!events.length) {
        return errorResponse(
          req,
          res,
          "No events found for the specified user",
          404
        );
      }
    } else {
      events = await db.event.findMany();
    }

    return successResponse(res, "Events fetched successfully", events);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const getEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const event = await db.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return errorResponse(req, res, "Event not found", 404);
    }

    return successResponse(res, "Event fetched successfully", event);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const getLoggedInUserEvents = async (req: Request, res: Response) => {
  try {
    const events = await db.event.findMany({
      where: {
        organizerId: req.session.user?.id,
      },
    });

    if (!events) {
      return errorResponse(req, res, "No events found", 404);
    }

    return successResponse(res, "Events fetched successfully", events);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const getLoggedInEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const event = await db.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return errorResponse(req, res, "Event not found", 404);
    }

    if (event.organizerId !== req.session.user?.id) {
      return errorResponse(
        req,
        res,
        "You are not authorized to view this event",
        403
      );
    }

    return successResponse(res, "Event fetched successfully", event);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, image, startTime, endTime } = eventSchema.parse(
      req.body
    );
    const organizerId = req.session.user?.id;

    if (organizerId === undefined) {
      return errorResponse(
        req,
        res,
        "Organizer ID is missing, Please Login",
        400
      );
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        image,
        startTime,
        endTime,
        organizerId,
      },
    });

    return successResponse(res, "Event created successfully", event);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, image, startTime, endTime } = eventSchema.parse(
      req.body
    );

    const event = await db.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return errorResponse(req, res, "Event not found", 404);
    }

    if (event.organizerId !== req.session.user?.id) {
      return errorResponse(
        req,
        res,
        "You are not authorized to update this event",
        403
      );
    }

    const updatedEvent = await db.event.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        image,
        startTime,
        endTime,
      },
    });

    return successResponse(res, "Event updated successfully", updatedEvent);
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const event = await db.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return errorResponse(req, res, "Event not found", 404);
    }

    if (event.organizerId !== req.session.user?.id) {
      return errorResponse(
        req,
        res,
        "You are not authorized to delete this event",
        403
      );
    }

    await db.event.delete({
      where: {
        id,
      },
    });

    return successResponse(res, "Event deleted successfully", {});
  } catch (e: any) {
    return errorResponse(req, res, e.message, 500);
  }
};

export {
  getAllEvents,
  getEvent,
  getLoggedInUserEvents,
  getLoggedInEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
