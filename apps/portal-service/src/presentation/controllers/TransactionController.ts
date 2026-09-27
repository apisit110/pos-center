import { Request, Response, NextFunction } from 'express';
import { GetTransactionsUseCase } from '../../application/usecases/GetTransactionsUseCase';
import { getTransactionsQuerySchema } from '../dtos/request/GetTransactionsQueryDto';
import { toTransactionResponseDto } from '../dtos/response/TransactionResponseDto';
import { PaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';

export class TransactionController {
  constructor(private getTransactionsUseCase: GetTransactionsUseCase) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, transactionId, orderId, method, status, startDate, endDate } =
        getTransactionsQuerySchema.parse(req.query);

      const result = await this.getTransactionsUseCase.execute(page, limit, {
        transactionId,
        orderId,
        method,
        status,
        startDate,
        endDate,
      });

      const response: PaginatedResponseDto<ReturnType<typeof toTransactionResponseDto>> = {
        items: result.transactions.map(toTransactionResponseDto),
        total: result.total,
        page,
        limit,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
