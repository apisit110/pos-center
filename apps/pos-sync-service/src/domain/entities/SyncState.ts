/** Current versions of the data the client pulls; the client pulls a resource only when its version changed. */
export class SyncState {
  constructor(
    /** max `map_store_product.sync_version` of the store, pull products when it is > the client's last `syncVersion` */
    public readonly productVersion: number,
    /** fingerprint of the cashier profile, pull cashier-profile when it is != the client's last `profile_version` */
    public readonly profileVersion: string,
  ) {}
}
