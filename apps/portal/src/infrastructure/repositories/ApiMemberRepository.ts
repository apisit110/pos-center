import { Member } from '../../domain/entities/Member';
import { MemberFilter, MemberRepository } from '../../domain/repositories/MemberRepository';
import ApiClient from '../api/ApiClient';

export class ApiMemberRepository implements MemberRepository {
  async getMembers(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    const params = { page, limit, ...filters };
    const response = await ApiClient.get('/members', { params });
    const { members, total } = response.data;
    
    return {
      members: members.map((m: any) => new Member(
        m.id, m.firstName, m.lastName, m.email, m.phone, m.tier, m.points, new Date(m.createdAt)
      )),
      total
    };
  }

  async getMemberById(id: string): Promise<Member | null> {
    try {
      const response = await ApiClient.get(`/members/${id}`);
      const m = response.data;
      return new Member(
        m.id, m.firstName, m.lastName, m.email, m.phone, m.tier, m.points, new Date(m.createdAt)
      );
    } catch (error) {
      return null;
    }
  }
}
