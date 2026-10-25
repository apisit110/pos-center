import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export interface BulkCreateProductItem {
  uid?: string;
  merchantUid: string;
  nameEn: string;
  nameTh: string;
  barcode?: string;
  basePrice: number;
  imageUrl?: string;
  brandUid?: string;
  unitName?: string;
}

export interface BulkCreateProductsResult {
  created: number;
  errors: Array<{ index: number; nameEn: string; message: string }>;
}

export class BulkCreateProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly merchantRepository: IMerchantRepository,
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, items: BulkCreateProductItem[]): Promise<BulkCreateProductsResult> {
    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid || items.some((item) => item.merchantUid !== ownMerchantUid)) {
        throw ServiceError.ErrForbidden();
      }
    }

    if (items.length === 0) return { created: 0, errors: [] };

    const errors: BulkCreateProductsResult['errors'] = [];
    const failedIndexes = new Set<number>();
    const fail = (index: number, message: string) => {
      failedIndexes.add(index);
      errors.push({ index, nameEn: items[index].nameEn, message });
    };

    // Find each unique merchant once
    const merchantPartnerId = new Map<string, string>();
    for (const merchantUid of new Set(items.map((item) => item.merchantUid))) {
      const merchant = await this.merchantRepository.getById(merchantUid);
      if (merchant) {
        merchantPartnerId.set(merchantUid, merchant.partnerId);
        continue;
      }
      items.forEach((item, index) => {
        if (item.merchantUid === merchantUid) fail(index, `Merchant not found: ${merchantUid}`);
      });
    }

    // Find each unique brand once
    const brandUids = [...new Set(items.filter((item, index) => item.brandUid && !failedIndexes.has(index)).map((item) => item.brandUid!))];
    const brandsByUid = new Map((await this.productRepository.findBrandsByUids(brandUids)).map((brand) => [brand.uid, brand]));
    items.forEach((item, index) => {
      if (item.brandUid && !failedIndexes.has(index) && !brandsByUid.has(item.brandUid)) {
        fail(index, `Brand not found: ${item.brandUid}`);
      }
    });

    // Check uid (only when provided), in request order:
    //  - the same uid already appears in an earlier product of the request
    //  - the uid already exists in the database under another merchant (nothing is updated)
    const providedUids = [...new Set(items.filter((item, index) => item.uid && !failedIndexes.has(index)).map((item) => item.uid!))];
    const existingOwners = new Map(
      (await this.productRepository.findOwnersByUids(providedUids)).map((owner) => [owner.productUid, owner.merchantUid]),
    );
    const seenUids = new Set<string>();
    items.forEach((item, index) => {
      if (!item.uid) return;
      const isDuplicate = seenUids.has(item.uid);
      seenUids.add(item.uid);
      if (failedIndexes.has(index)) return;

      if (isDuplicate) {
        fail(index, `Duplicate uid: ${item.uid}`);
        return;
      }
      const ownerMerchantUid = existingOwners.get(item.uid);
      if (ownerMerchantUid !== undefined && ownerMerchantUid !== item.merchantUid) {
        fail(index, 'Forbidden: uid belongs to another merchant');
      }
    });

    // Duplicate barcode: with another product of the merchant in the database, or with an earlier product of the request
    const barcodesByMerchant = new Map<string, Set<string>>();
    items.forEach((item, index) => {
      if (failedIndexes.has(index) || !item.barcode) return;
      const barcodes = barcodesByMerchant.get(item.merchantUid) ?? new Set<string>();
      barcodes.add(item.barcode);
      barcodesByMerchant.set(item.merchantUid, barcodes);
    });

    const ownersByMerchant = new Map<string, Map<string, string[]>>();
    for (const [merchantUid, barcodes] of barcodesByMerchant) {
      const owners = await this.productRepository.findBarcodeOwners(merchantUid, [...barcodes]);
      const byBarcode = new Map<string, string[]>();
      for (const owner of owners) {
        byBarcode.set(owner.barcode, [...(byBarcode.get(owner.barcode) ?? []), owner.productUid]);
      }
      ownersByMerchant.set(merchantUid, byBarcode);
    }

    const seenInRequest = new Map<string, Set<string>>();
    items.forEach((item, index) => {
      if (failedIndexes.has(index) || !item.barcode) return;

      const dbOwners = ownersByMerchant.get(item.merchantUid)?.get(item.barcode) ?? [];
      const duplicateInDatabase = dbOwners.some((ownerUid) => ownerUid !== item.uid);
      const seen = seenInRequest.get(item.merchantUid) ?? new Set<string>();
      if (duplicateInDatabase || seen.has(item.barcode)) {
        fail(index, `Duplicate barcode: ${item.barcode}`);
        return;
      }
      seen.add(item.barcode);
      seenInRequest.set(item.merchantUid, seen);
    });

    const entities = items
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => !failedIndexes.has(index))
      .map(({ item }) => new Product(
        item.uid || uuidv4(),
        item.merchantUid,
        merchantPartnerId.get(item.merchantUid)!,
        item.nameEn,
        item.nameTh,
        item.barcode || '', // sku = barcode
        item.barcode || '',
        item.basePrice,
        item.imageUrl ?? '',
        item.brandUid ? brandsByUid.get(item.brandUid)! : null,
        item.unitName ?? '',
      ));

    errors.sort((a, b) => a.index - b.index);
    if (entities.length === 0) return { created: 0, errors };

    await this.productRepository.bulkSave(entities);
    return { created: entities.length, errors };
  }
}
