import express, { Request, Response } from 'express';
import cors from 'cors';

import { SyncPOSProductsUseCase } from './application/usecases/SyncPOSProductsUseCase';
import { SyncUsersUseCase } from './application/usecases/SyncUsersUseCase';
import { SyncOrdersFromClientUseCase } from './application/usecases/SyncOrdersFromClientUseCase';
import { SyncTransactionsFromClientUseCase } from './application/usecases/SyncTransactionsFromClientUseCase';
import { ReceiveProductsFromClientUseCase } from './application/usecases/ReceiveProductsFromClientUseCase';

import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleUserRepository } from './infrastructure/repositories/DrizzleUserRepository';
import { DrizzleOrderRepository } from './infrastructure/repositories/DrizzleOrderRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';

import { ProductSyncController } from './presentation/controllers/ProductSyncController';
import { UserSyncController } from './presentation/controllers/UserSyncController';
import { OrderSyncController } from './presentation/controllers/OrderSyncController';
import { TransactionSyncController } from './presentation/controllers/TransactionSyncController';

import { createSyncRouter } from './presentation/routes/sync.routes';
import { loggerMiddleware } from './presentation/middleware/LoggerMiddleware';
import { errorMiddleware } from './presentation/middleware/ErrorMiddleware';

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Initialize Infrastructure (repositories)
const productRepo = new DrizzleProductRepository();
const userRepo = new DrizzleUserRepository();
const orderRepo = new DrizzleOrderRepository();
const transactionRepo = new DrizzleTransactionRepository();

// Initialize Application (use cases)
const syncUseCase = new SyncPOSProductsUseCase(productRepo);
const receiveProductsUseCase = new ReceiveProductsFromClientUseCase(productRepo);
const syncUsersUseCase = new SyncUsersUseCase(userRepo);
const syncOrdersUseCase = new SyncOrdersFromClientUseCase(orderRepo);
const syncTransactionsUseCase = new SyncTransactionsFromClientUseCase(transactionRepo);

// Initialize Presentation (controllers)
const productSyncController = new ProductSyncController(syncUseCase, receiveProductsUseCase);
const userSyncController = new UserSyncController(syncUsersUseCase);
const orderSyncController = new OrderSyncController(syncOrdersUseCase);
const transactionSyncController = new TransactionSyncController(syncTransactionsUseCase);

// Routes
const syncRouter = createSyncRouter(
  productSyncController,
  userSyncController,
  orderSyncController,
  transactionSyncController
);
app.use(syncRouter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'pos-sync-service' });
});

// Error Handling Middleware (must be after all routes)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[pos-sync-service]: Server is running at http://localhost:${port}`);
});
