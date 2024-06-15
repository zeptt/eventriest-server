import { z } from "zod";

const ticketSchema = z.object({
    name: z.string().min(3).max(100),
    price: z.number(),
    type: z.enum(["free", "paid"]),
    quantity: z.number(),
    startTime: z.string(),
    endTime: z.string(),
});

const purchaseTicketSchema = z.object({
    quantity: z.number(),
});

export { ticketSchema, purchaseTicketSchema };
