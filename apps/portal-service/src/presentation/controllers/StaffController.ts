import { Request, Response, NextFunction } from 'express';
import { GetStaffUseCase } from '../../application/usecases/GetStaffUseCase';
import { GetStaffDetailUseCase } from '../../application/usecases/GetStaffDetailUseCase';
import { getStaffQuerySchema } from '../dtos/request/GetStaffQueryDto';
import { idParamSchema } from '../dtos/request/CommonRequestDto';
import { toStaffResponseDto } from '../dtos/response/StaffResponseDto';
import { toPaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

export class StaffController {
  constructor(
    private getStaffUseCase: GetStaffUseCase,
    private getStaffDetailUseCase: GetStaffDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getStaffQuerySchema.parse(req.query);

      const result = await this.getStaffUseCase.execute(actorOf(req), {
        page: query.page,
        limit: query.limit,
        merchantUid: query.merchant_uid,
        role: query.role,
        username: query.username,
        status: query.status,
        query: query.query,
        startDate: query.start_date,
        endDate: query.end_date,
      });
      sendOk(res, toPaginatedResponseDto(result.staff, result.total, result.page, result.limit, toStaffResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const staffMember = await this.getStaffDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toStaffResponseDto(staffMember));
    } catch (error) {
      next(error);
    }
  }
}
