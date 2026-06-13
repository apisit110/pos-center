import { Request, Response, NextFunction } from 'express';
import { GetMembersUseCase } from '../../domain/usecases/GetMembersUseCase';
import { GetMemberDetailUseCase } from '../../domain/usecases/GetMemberDetailUseCase';

export class MemberController {
  constructor(
    private getMembersUseCase: GetMembersUseCase,
    private getMemberDetailUseCase: GetMemberDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const query = req.query.query as string;
      const tier = req.query.tier as string;

      const result = await this.getMembersUseCase.execute(page, limit, { query, tier });
      res.status(200).json(result);
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
      
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }
}
