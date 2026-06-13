import { IMemberRepository, MemberFilter } from '../repositories/IMemberRepository';
import { Member } from '../entities/Member';

export class GetMembersUseCase {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    return this.memberRepository.getMembers(page, limit, filters);
  }
}
