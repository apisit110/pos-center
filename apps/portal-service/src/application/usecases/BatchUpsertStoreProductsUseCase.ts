import {
  IStoreProductRepository,
  StoreProductRowError,
  UpsertStoreProductByUidInput,
} from '../../domain/repositories/IStoreProductRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';

/** One row of the request; the DTO coerces `stock` and `price` to numbers (NaN / undefined when invalid). */
export interface BatchStoreProductMappingRequest {
  storeUid?: string;
  productUid?: string;
  stock?: number;
  price?: number;
}

export interface BatchStoreProductMappingResult {
  created: number;
  updated: number;
  errors: string[];
}

const CHUNK_SIZE = 500;

const isNonNegativeNumber = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value) && value >= 0;

export class BatchUpsertStoreProductsUseCase {
  constructor(
    private readonly storeProductRepository: IStoreProductRepository,
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, mappings: BatchStoreProductMappingRequest[]): Promise<BatchStoreProductMappingResult> {
    let created = 0;
    let updated = 0;
    const rowErrors: Array<{ row: number; message: string }> = [];
    const addError = (index: number, reason: string) => rowErrors.push({ row: index + 1, message: `Row ${index + 1}: ${reason}` });
    const buildResult = (): BatchStoreProductMappingResult => ({
      created,
      updated,
      errors: rowErrors.sort((a, b) => a.row - b.row).map((e) => e.message),
    });

    type ValidItem = UpsertStoreProductByUidInput & { originalIndex: number };
    const validItems: ValidItem[] = [];

    for (const [index, mapping] of mappings.entries()) {
      const { storeUid, productUid, stock, price } = mapping;

      if (!storeUid || !productUid) {
        addError(index, 'store_uid and product_uid are required');
        continue;
      }
      if (!isNonNegativeNumber(stock)) {
        addError(index, 'stock must be a non-negative number');
        continue;
      }
      if (!isNonNegativeNumber(price)) {
        addError(index, 'price must be a non-negative number');
        continue;
      }
      validItems.push({ storeUid, productUid, stock, price, originalIndex: index });
    }

    // PRODUCT_OWNER may use any store and product, other roles only those of their own merchant
    let onlyMerchantUid: string | undefined;
    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid) {
        for (const item of validItems) addError(item.originalIndex, 'forbidden');
        return buildResult();
      }
      onlyMerchantUid = ownMerchantUid;
    }

    for (let i = 0; i < validItems.length; i += CHUNK_SIZE) {
      const chunk = validItems.slice(i, i + CHUNK_SIZE);
      const result = await this.storeProductRepository.batchUpsertByUids(
        chunk.map(({ storeUid, productUid, stock, price }) => ({ storeUid, productUid, stock, price })),
        onlyMerchantUid,
      );
      created += result.created;
      updated += result.updated;
      for (const err of result.errors) {
        addError(chunk[err.index].originalIndex, this.describe(err));
      }
    }

    return buildResult();
  }

  private describe(error: StoreProductRowError): string {
    switch (error.code) {
      case 'STORE_NOT_FOUND': return `store_uid "${error.uid}" not found`;
      case 'PRODUCT_NOT_FOUND': return `product_uid "${error.uid}" not found`;
      case 'FORBIDDEN': return 'forbidden';
    }
  }
}
