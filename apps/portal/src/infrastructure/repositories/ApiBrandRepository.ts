import { Brand } from '../../domain/entities/Product';
import { BrandRepository } from '../../domain/repositories/BrandRepository';
import ApiClient, { API_V1, unwrap } from '../api/ApiClient';

// max items per batch request (see docs/portal/flow/brand/post-brands-batch.md)
const BATCH_CHUNK_SIZE = 1000;

export class ApiBrandRepository implements BrandRepository {
  public async upsertBrands(brands: Brand[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    for (let offset = 0; offset < brands.length; offset += BATCH_CHUNK_SIZE) {
      const chunk = brands.slice(offset, offset + BATCH_CHUNK_SIZE);
      const response = await ApiClient.post(`${API_V1}/brands/batch`, {
        brands: chunk.map((b) => ({ uid: b.uid, name_en: b.nameEn, name_th: b.nameTh })),
      });
      const result = unwrap<{ created: number; updated: number }>(response);
      created += result.created;
      updated += result.updated;
    }
    return { created, updated };
  }
}
