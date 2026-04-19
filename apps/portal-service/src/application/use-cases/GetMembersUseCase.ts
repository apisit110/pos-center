import { MemberRepository, MemberFilter } from '../repositories/MemberRepository';
import { Member } from '../../domain/entities/Member';

export class GetMembersUseCase {
  constructor(private memberRepository: MemberRepository) {}

  async execute(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    return this.memberRepository.getMembers(page, limit, filters);
  }
}
