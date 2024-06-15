import { NextFunction, Request, Response, Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getLoggedInEvent,
  getLoggedInUserEvents,
  updateEvent,
} from "../controller/event";

export const eventRouter = Router();

eventRouter.get("/", getAllEvents);
eventRouter.get("/my-events", getLoggedInUserEvents);
eventRouter.get("/my-events/:id", getLoggedInEvent);
eventRouter.get("/:id", getEvent);
eventRouter.post("/", createEvent); 
eventRouter.put("/:id", updateEvent);
eventRouter.delete("/:id", deleteEvent);

eventRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ error: "EventRouter Error", message: err.message });
  }
);
