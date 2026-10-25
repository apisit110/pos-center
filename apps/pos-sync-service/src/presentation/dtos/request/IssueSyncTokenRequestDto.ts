import { z } from 'zod';

export const issueSyncTokenHeadersSchema = z.object({
  'x-partner-id': z.string().min(1, 'x-partner-id is required'),
  'x-client-id': z.string().min(1, 'x-client-id is required'),
  'x-client-secret': z.string().min(1, 'x-client-secret is required'),
});

export const issueSyncTokenRequestSchema = z.object({
  tid: z.string().min(1, 'tid is required'),
});

export type IssueSyncTokenHeadersDto = z.infer<typeof issueSyncTokenHeadersSchema>;
export type IssueSyncTokenRequestDto = z.infer<typeof issueSyncTokenRequestSchema>;
