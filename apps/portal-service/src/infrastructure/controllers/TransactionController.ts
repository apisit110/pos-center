import { Request, Response, NextFunction } from 'express';
import { GetTransactionsUseCase } from '../../domain/usecases/GetTransactionsUseCase';

export class TransactionController {
  constructor(private getTransactionsUseCase: GetTransactionsUseCase) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactionId = req.query.transactionId as string | undefined;
      const orderId = req.query.orderId as string | undefined;
      const method = req.query.method as string | undefined;
      const status = req.query.status as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const result = await this.getTransactionsUseCase.execute(page, limit, {
        transactionId,
        orderId,
        method,
        status,
        startDate,
        endDate,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
