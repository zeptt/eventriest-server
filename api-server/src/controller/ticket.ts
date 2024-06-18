import { Request, Response } from "express";
import { db } from "../db";
import { errorResponse, successResponse } from "../utils/responses";
import { purchaseTicketSchema, ticketSchema } from "../schema/ticket";

const createTicket = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.eventId);
  console.log("Event ID", eventId);
  const userId = req.session.user?.id;
  const { name, price, quantity, startTime, endTime, type } =
    ticketSchema.parse(req.body);

  try {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event || event.organizerId !== userId) {
      return errorResponse(
        req,
        res,
        "No events found for the specified user",
        404
      );
    }

    const newTicket = await db.ticket.create({
      data: {
        name,
        type,
        price: price,
        totalQuantity: quantity,
        quantityLeft: quantity,
        startTime: startTime,
        endTime: endTime,
        eventId: eventId,
        userId: userId,
      },
    });

    return successResponse(res, "Ticket created successfully", newTicket);
  } catch (e: any) {
    return errorResponse(req, res, "Error Creating Ticket -" + e.message, 500);
  }
};

const purchaseTicket = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.eventId);
  const ticketId = parseInt(req.params.ticketId);
  const userId = req.session.user?.id;
  const { quantity } = purchaseTicketSchema.parse(req.body);

  if (!userId) {
    return errorResponse(req, res, "User not authenticated", 401);
  }

  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket || ticket.eventId !== eventId) {
      return errorResponse(req, res, "Ticket not found", 404);
    }

    if (ticket.userId === userId) {
      return errorResponse(
        req,
        res,
        "You cannot purchase your own ticket",
        400
      );
    }

    if (ticket.quantityLeft < quantity) {
      return errorResponse(req, res, "Not enough tickets left", 400);
    }

    await db.ticket.update({
      where: { id: ticketId },
      data: {
        quantityLeft: ticket.quantityLeft - quantity,
      },
    });

    const newPurchase = await db.ticketPurchase.create({
      data: {
        ticketId: ticket.id,
        userId: userId,
        eventId: ticket.eventId,
        quantity: quantity,
        price: ticket.price * quantity,
      },
    });

    return successResponse(res, "Ticket purchased successfully", newPurchase);
  } catch (e: any) {
    return errorResponse(
      req,
      res,
      "Error Purchasing Ticket - " + e.message,
      500
    );
  }
};

export { createTicket, purchaseTicket };
