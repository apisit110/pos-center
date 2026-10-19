export interface IRunningNumberService {
  nextMid(): Promise<string>;
  nextSid(mid: string): Promise<string>;
  nextTid(sid: string): Promise<string>;
  nextStaffUsername(mid: string): Promise<string>;
}
