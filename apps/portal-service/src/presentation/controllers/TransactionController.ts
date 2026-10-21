import { Request, Response, NextFunction } from 'express';
import { GetTransactionsUseCase } from '../../application/usecases/GetTransactionsUseCase';
import { GetTransactionDetailUseCase } from '../../application/usecases/GetTransactionDetailUseCase';
import { getTransactionsQuerySchema } from '../dtos/request/GetTransactionsQueryDto';
import { toTransactionResponseDto, toTransactionDetailResponseDto } from '../dtos/response/TransactionResponseDto';
import { toPaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

export class TransactionController {
  constructor(
    private getTransactionsUseCase: GetTransactionsUseCase,
    private getTransactionDetailUseCase: GetTransactionDetailUseCase,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getTransactionsQuerySchema.parse(req.query);

      const result = await this.getTransactionsUseCase.execute(actorOf(req), {
        page: query.page,
        limit: query.limit,
        transactionId: query.transaction_id,
        orderId: query.order_id,
        method: query.method,
        status: query.status,
        startDate: query.start_date,
        endDate: query.end_date,
      });

      sendOk(res, toPaginatedResponseDto(result.transactions, result.total, result.page, result.limit, toTransactionResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const detail = await this.getTransactionDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toTransactionDetailResponseDto(detail));
    } catch (error) {
      next(error);
    }
  }
}
