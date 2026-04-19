import { MemberRepository } from '../repositories/MemberRepository';
import { Member } from '../../domain/entities/Member';

export class GetMemberDetailUseCase {
  constructor(private memberRepository: MemberRepository) {}

  async execute(id: string): Promise<Member | null> {
    return this.memberRepository.getMemberById(id);
  }
}
