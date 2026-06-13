import { IMemberRepository } from '../repositories/IMemberRepository';
import { Member } from '../entities/Member';

export class GetMemberDetailUseCase {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(id: string): Promise<Member | null> {
    return this.memberRepository.getMemberById(id);
  }
}
