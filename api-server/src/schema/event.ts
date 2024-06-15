import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(2000),
  image: z.string().url(),
  startTime: z.string(),
  endTime: z.string(),
});

export { eventSchema };
