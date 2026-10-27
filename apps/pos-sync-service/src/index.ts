import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

import { SyncPOSProductsUseCase } from './application/usecases/SyncPOSProductsUseCase';
import { SyncOrdersFromClientUseCase } from './application/usecases/SyncOrdersFromClientUseCase';
import { SyncTransactionsFromClientUseCase } from './application/usecases/SyncTransactionsFromClientUseCase';
import { ReceiveProductsFromClientUseCase } from './application/usecases/ReceiveProductsFromClientUseCase';
import { PullCashierProfileUseCase } from './application/usecases/PullCashierProfileUseCase';
import { AuthenticateMerchantCredentialUseCase } from './application/usecases/AuthenticateMerchantCredentialUseCase';
import { IssueSyncTokenUseCase } from './application/usecases/IssueSyncTokenUseCase';
import { GetSyncStateUseCase } from './application/usecases/GetSyncStateUseCase';

import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleOrderRepository } from './infrastructure/repositories/DrizzleOrderRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';
import { DrizzleCashierProfileRepository } from './infrastructure/repositories/DrizzleCashierProfileRepository';
import { DrizzleMerchantCredentialRepository } from './infrastructure/repositories/DrizzleMerchantCredentialRepository';
import { DrizzleSyncStateRepository } from './infrastructure/repositories/DrizzleSyncStateRepository';
import { JwtSyncTokenService } from './infrastructure/services/JwtSyncTokenService';

import { ProductSyncController } from './presentation/controllers/ProductSyncController';
import { OrderSyncController } from './presentation/controllers/OrderSyncController';
import { TransactionSyncController } from './presentation/controllers/TransactionSyncController';
import { CashierProfileSyncController } from './presentation/controllers/CashierProfileSyncController';
import { SyncAuthController } from './presentation/controllers/SyncAuthController';
import { SyncStateController } from './presentation/controllers/SyncStateController';

import { createSyncRouter } from './presentation/routes/sync.routes';
import { loggerMiddleware } from './presentation/middleware/LoggerMiddleware';
import { errorMiddleware } from './presentation/middleware/ErrorMiddleware';
import { syncTokenMiddleware } from './presentation/middleware/SyncTokenMiddleware';
import { originSecretMiddleware } from './presentation/middleware/CloudFrontMiddleware';

const app = express();
const port = process.env.PORT || 4002;

const SYNC_JWT_SECRET = process.env.SYNC_JWT_SECRET;
if (!SYNC_JWT_SECRET) {
  throw new Error('SYNC_JWT_SECRET environment variable is required');
}

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
// serverless: only CloudFront may call the Lambda Function URL (/health stays open)
app.use(originSecretMiddleware(process.env.ORIGIN_SECRET));

// Initialize Infrastructure (repositories)
const productRepo = new DrizzleProductRepository();
const orderRepo = new DrizzleOrderRepository();
const transactionRepo = new DrizzleTransactionRepository();
const cashierProfileRepo = new DrizzleCashierProfileRepository();
const merchantCredentialRepo = new DrizzleMerchantCredentialRepository();
const syncStateRepo = new DrizzleSyncStateRepository();
const syncTokenService = new JwtSyncTokenService(SYNC_JWT_SECRET);

// Initialize Application (use cases)
const syncUseCase = new SyncPOSProductsUseCase(productRepo);
const receiveProductsUseCase = new ReceiveProductsFromClientUseCase(productRepo);
const syncOrdersUseCase = new SyncOrdersFromClientUseCase(orderRepo);
const syncTransactionsUseCase = new SyncTransactionsFromClientUseCase(transactionRepo);
const pullCashierProfileUseCase = new PullCashierProfileUseCase(cashierProfileRepo, syncStateRepo);
const authenticateMerchantCredentialUseCase = new AuthenticateMerchantCredentialUseCase(merchantCredentialRepo);
const getSyncStateUseCase = new GetSyncStateUseCase(syncStateRepo);
const issueSyncTokenUseCase = new IssueSyncTokenUseCase(authenticateMerchantCredentialUseCase, cashierProfileRepo, syncTokenService);

// Initialize Presentation (controllers)
const productSyncController = new ProductSyncController(syncUseCase, receiveProductsUseCase, getSyncStateUseCase);
const orderSyncController = new OrderSyncController(syncOrdersUseCase, getSyncStateUseCase);
const transactionSyncController = new TransactionSyncController(syncTransactionsUseCase, getSyncStateUseCase);
const cashierProfileSyncController = new CashierProfileSyncController(pullCashierProfileUseCase);
const syncAuthController = new SyncAuthController(issueSyncTokenUseCase);
const syncStateController = new SyncStateController(getSyncStateUseCase);

// Routes
const syncRouter = createSyncRouter(
  productSyncController,
  orderSyncController,
  transactionSyncController,
  cashierProfileSyncController,
  syncAuthController,
  syncStateController,
  syncTokenMiddleware(syncTokenService)
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
