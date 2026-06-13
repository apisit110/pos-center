import { Member } from '../../domain/entities/Member';

export interface MemberFilter {
  query?: string;
  tier?: string[];
}

export interface MemberRepository {
  getMembers(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }>;
  getMemberById(id: string): Promise<Member | null>;
}
