import { z } from 'zod';
import { MAX_BATCH_ITEMS } from './BulkCreateProductsRequestDto';

/**
 * The fields of each mapping are not validated here: a bad row must not fail the whole request,
 * it is reported in `errors` by the use case. `stock` and `price` are only coerced to numbers.
 */
export const batchUpsertStoreProductsSchema = z.object({
  mappings: z
    .array(
      z.object({
        store_uid: z.unknown().optional(),
        product_uid: z.unknown().optional(),
        stock: z.unknown().optional(),
        price: z.unknown().optional(),
      }),
    )
    .max(MAX_BATCH_ITEMS),
});

export type BatchUpsertStoreProductsRequestDto = z.infer<typeof batchUpsertStoreProductsSchema>;

/** number, or numeric string; anything else is NaN (invalid row) */
export function coerceNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

export function coerceString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
