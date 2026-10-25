export interface ISyncStateRepository {
  /** max `map_store_product.sync_version` of the store, 0 when the store has no products */
  findProductVersion(partnerId: string, sid: string): Promise<number>;
  /**
   * Fingerprint of the data of pull cashier-profile (merchant, terminal + store, staffs, staff roles, pins).
   * Built from row counts and max `updated_at`, so it changes on every insert / update / delete of that data.
   */
  findProfileVersion(partnerId: string, tid: string): Promise<string>;
}
