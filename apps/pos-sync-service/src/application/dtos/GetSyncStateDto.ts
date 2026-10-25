/** terminal of the sync token */
export interface GetSyncStateRequest {
  /** merchant `partner_id` */
  partnerId: string;
  /** store `sid` */
  sid: string;
  /** terminal `tid` */
  tid: string;
}
