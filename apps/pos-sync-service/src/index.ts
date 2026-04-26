import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { SyncPOSProductsUseCase } from './application/use-cases/SyncPOSProductsUseCase';
import { SyncUsersUseCase } from './application/use-cases/SyncUsersUseCase';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleUserRepository } from './infrastructure/repositories/DrizzleUserRepository';

import { syncProductSchema } from './infrastructure/validation/SyncProductSchema';
import { SyncUserSchema } from './infrastructure/validation/SyncUserSchema';
import { ZodError } from 'zod';

import { loggerMiddleware } from './infrastructure/middleware/LoggerMiddleware';
import { errorMiddleware } from './infrastructure/middleware/ErrorMiddleware';

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Initialize Dependencies
const productRepo = new DrizzleProductRepository();
const userRepo = new DrizzleUserRepository();
const syncUseCase = new SyncPOSProductsUseCase(productRepo);
const syncUsersUseCase = new SyncUsersUseCase(userRepo);

app.post('/v1/sync/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = syncProductSchema.parse(req.body);
    const { merchantId, storeId, syncVersion } = validatedData;

    console.log(`[pos-sync-service] Triggering sync for merchant: ${merchantId}, store: ${storeId}, version: ${syncVersion}`);
    
    const result = await syncUseCase.execute(merchantId, storeId, syncVersion);

    if (result.success) {
      return res.status(200).json({
        message: 'Sync completed successfully',
        products: result.products,
        count: result.products.length
      });
    } else {
      return res.status(500).json({ message: 'Sync failed' });
    }
  } catch (error) {
    next(error);
  }
});

app.post('/v1/sync/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = SyncUserSchema.parse(req.body);
    console.log(`[pos-sync-service] Syncing ${validatedData.users.length} users from POS`);
    
    const results = await syncUsersUseCase.execute(validatedData.users as any);

    return res.status(200).json({
      message: 'User sync process completed',
      results
    });
  } catch (error) {
    next(error);
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'pos-sync-service' });
});

// Error Handling Middleware (must be after all routes)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[pos-sync-service]: Server is running at http://localhost:${port}`);
});
