import { Request, Response, NextFunction } from 'express';
import { GetMembersUseCase } from '../../application/usecases/GetMembersUseCase';
import { GetMemberDetailUseCase } from '../../application/usecases/GetMemberDetailUseCase';
import { getMembersQuerySchema } from '../dtos/request/GetMembersQueryDto';
import { toMemberResponseDto } from '../dtos/response/MemberResponseDto';
import { PaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';

export class MemberController {
  constructor(
    private getMembersUseCase: GetMembersUseCase,
    private getMemberDetailUseCase: GetMemberDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, query, tier } = getMembersQuerySchema.parse(req.query);

      const result = await this.getMembersUseCase.execute(page, limit, { query, tier });
      const response: PaginatedResponseDto<ReturnType<typeof toMemberResponseDto>> = {
        items: result.members.map(toMemberResponseDto),
        total: result.total,
        page,
        limit,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await this.getMemberDetailUseCase.execute(id);

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.status(200).json(toMemberResponseDto(member));
    } catch (error) {
      next(error);
    }
  }
}
