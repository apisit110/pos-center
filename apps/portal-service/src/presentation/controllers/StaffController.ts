import { Request, Response, NextFunction } from 'express';
import { GetStaffUseCase } from '../../application/usecases/GetStaffUseCase';
import { GetStaffDetailUseCase } from '../../application/usecases/GetStaffDetailUseCase';
import { getStaffQuerySchema } from '../dtos/request/GetStaffQueryDto';
import { toStaffResponseDto } from '../dtos/response/StaffResponseDto';
import { PaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';

export class StaffController {
  constructor(
    private getStaffUseCase: GetStaffUseCase,
    private getStaffDetailUseCase: GetStaffDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, merchantId, role, username, status, startDate, endDate, query } =
        getStaffQuerySchema.parse(req.query);

      const result = await this.getStaffUseCase.execute(page, limit, {
        merchantId,
        role,
        username,
        status,
        startDate,
        endDate,
        query,
      });
      const response: PaginatedResponseDto<ReturnType<typeof toStaffResponseDto>> = {
        items: result.staff.map(toStaffResponseDto),
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
      const staffMember = await this.getStaffDetailUseCase.execute(id);

      if (!staffMember) {
        return res.status(404).json({ message: 'Staff member not found' });
      }

      res.status(200).json(toStaffResponseDto(staffMember));
    } catch (error) {
      next(error);
    }
  }
}
