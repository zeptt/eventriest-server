import { NextFunction, Request, Response, Router } from "express";
import { createTicket, purchaseTicket } from "../controller/ticket";
import { errorResponse } from "../utils/responses";

const ticketRouter = Router();

ticketRouter.post("/:eventId/tickets", createTicket);
ticketRouter.post("/:eventId/tickets/:ticketId/purchase", purchaseTicket);

ticketRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    errorResponse(req, res, "Ticket Router Error" + err.message, 500);
  }
);

export default ticketRouter;
