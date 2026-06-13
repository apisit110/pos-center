import { Request, Response, NextFunction } from 'express';
import { GetStaffUseCase } from '../../domain/usecases/GetStaffUseCase';
import { GetStaffDetailUseCase } from '../../domain/usecases/GetStaffDetailUseCase';

export class StaffController {
  constructor(
    private getStaffUseCase: GetStaffUseCase,
    private getStaffDetailUseCase: GetStaffDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const merchantId = req.query.merchantId as string;
      const role = req.query.role as string;
      const username = req.query.username as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const query = req.query.query as string;

      const result = await this.getStaffUseCase.execute(page, limit, { merchantId, role, username, status, startDate, endDate, query });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const staffMember = await this.getStaffDetailUseCase.execute(id);
      
      if (!staffMember) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      
      res.status(200).json(staffMember);
    } catch (error) {
      next(error);
    }
  }
}
