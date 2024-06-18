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
import { errorResponse } from "../utils/responses";

const eventRouter = Router();

eventRouter.get("/", getAllEvents);
eventRouter.get("/my-events", getLoggedInUserEvents);
eventRouter.get("/my-events/:id", getLoggedInEvent);
eventRouter.get("/:id", getEvent);
eventRouter.post("/", createEvent); 
eventRouter.put("/:id", updateEvent);
eventRouter.delete("/:id", deleteEvent);

eventRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    errorResponse(req, res, "Event Router Error"+ err.message, 500);
  }
);

export default eventRouter;