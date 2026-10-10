import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  pin: z.string().min(1, 'Pin is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
