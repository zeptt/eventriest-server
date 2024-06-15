import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  username: z.string().min(3).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export { registerSchema, loginSchema };
