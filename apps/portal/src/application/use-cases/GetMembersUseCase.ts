import { Member } from '../../domain/entities/Member';
import { MemberFilter, MemberRepository } from '../repositories/MemberRepository';

export class GetMembersUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    return this.memberRepository.getMembers(page, limit, filters);
  }
}
