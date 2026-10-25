export interface IRunningNumberService {
  nextPartnerId(): Promise<string>;
  nextSid(partnerId: string): Promise<string>;
  nextTid(sid: string): Promise<string>;
  nextStaffUsername(partnerId: string): Promise<string>;
}
