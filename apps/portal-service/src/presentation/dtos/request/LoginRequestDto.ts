import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1).max(255),
  pin: z.string().min(6).max(6),
});

export type LoginRequest = z.infer<typeof loginSchema>;
