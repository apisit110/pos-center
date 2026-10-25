import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Infrastructure: Repositories & Services
import { DrizzleMerchantRepository } from './infrastructure/repositories/DrizzleMerchantRepository';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleStoreRepository } from './infrastructure/repositories/DrizzleStoreRepository';
import { DrizzleStaffRepository } from './infrastructure/repositories/DrizzleStaffRepository';
import { DrizzleCashierStaffRepository } from './infrastructure/repositories/DrizzleCashierStaffRepository';
import { DrizzleAddressRepository } from './infrastructure/repositories/DrizzleAddressRepository';
import { DrizzleBrandRepository } from './infrastructure/repositories/DrizzleBrandRepository';
import { DrizzleTerminalRepository } from './infrastructure/repositories/DrizzleTerminalRepository';
import { DrizzleStoreProductRepository } from './infrastructure/repositories/DrizzleStoreProductRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';
import { DrizzlePinRepository } from './infrastructure/repositories/DrizzlePinRepository';
import { DrizzlePermissionRepository } from './infrastructure/repositories/DrizzlePermissionRepository';
import { JwtTokenService } from './infrastructure/services/JwtTokenService';
import { RunningNumberService } from './infrastructure/services/RunningNumberService';

// Application: Use Cases
import { GetMerchantsUseCase } from './application/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from './application/usecases/GetMerchantDetailUseCase';
import { GetProductsUseCase } from './application/usecases/GetProductsUseCase';
import { GetProductDetailUseCase } from './application/usecases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from './application/usecases/GetProductFilterMetadataUseCase';
import { CreateProductUseCase } from './application/usecases/CreateProductUseCase';
import { BulkCreateProductsUseCase } from './application/usecases/BulkCreateProductsUseCase';
import { GetStoresUseCase } from './application/usecases/GetStoresUseCase';
import { GetStoreDetailUseCase } from './application/usecases/GetStoreDetailUseCase';
import { GetStaffUseCase } from './application/usecases/GetStaffUseCase';
import { GetStaffDetailUseCase } from './application/usecases/GetStaffDetailUseCase';
import { GetStaffByMerchantUseCase } from './application/usecases/GetStaffByMerchantUseCase';
import { CreateMerchantUseCase } from './application/usecases/CreateMerchantUseCase';
import { CreateMerchantCredentialUseCase } from './application/usecases/CreateMerchantCredentialUseCase';
import { RotateMerchantCredentialUseCase } from './application/usecases/RotateMerchantCredentialUseCase';
import { GetTerminalsByStoreUseCase } from './application/usecases/GetTerminalsByStoreUseCase';
import { BatchUpsertStoreProductsUseCase } from './application/usecases/BatchUpsertStoreProductsUseCase';
import { GetTransactionDetailUseCase } from './application/usecases/GetTransactionDetailUseCase';
import { GetTransactionsUseCase } from './application/usecases/GetTransactionsUseCase';
import { LoginUseCase } from './application/usecases/LoginUseCase';
import { GetProfileUseCase } from './application/usecases/GetProfileUseCase';
import { GetAddressMasterDataUseCase } from './application/usecases/GetAddressMasterDataUseCase';
import { BatchUpsertBrandsUseCase } from './application/usecases/BatchUpsertBrandsUseCase';
import { PORTAL_APP_ID } from './domain/constants/app';

// Presentation: Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { MerchantController } from './presentation/controllers/MerchantController';
import { ProductController } from './presentation/controllers/ProductController';
import { StoreController } from './presentation/controllers/StoreController';
import { StaffController } from './presentation/controllers/StaffController';
import { StoreProductController } from './presentation/controllers/StoreProductController';
import { TransactionController } from './presentation/controllers/TransactionController';
import { MasterDataController } from './presentation/controllers/MasterDataController';
import { BrandController } from './presentation/controllers/BrandController';

// Presentation: Middleware
import { loggerMiddleware } from './presentation/middleware/LoggerMiddleware';
import { errorMiddleware } from './presentation/middleware/ErrorMiddleware';
import { serviceAuthMiddleware } from './presentation/middleware/AuthMiddleware';

// Presentation: Routes
import { authRoutes } from './presentation/routes/auth.routes';
import { merchantRoutes } from './presentation/routes/merchant.routes';
import { productRoutes } from './presentation/routes/product.routes';
import { storeProductRoutes } from './presentation/routes/storeProduct.routes';
import { storeRoutes } from './presentation/routes/store.routes';
import { staffRoutes } from './presentation/routes/staff.routes';
import { transactionRoutes } from './presentation/routes/transaction.routes';
import { masterDataRoutes } from './presentation/routes/masterData.routes';
import { brandRoutes } from './presentation/routes/brand.routes';

const app = express();
const port = process.env.PORT || 4001;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Initialize Infrastructure
const merchantRepository = new DrizzleMerchantRepository();
const productRepository = new DrizzleProductRepository();
const storeRepository = new DrizzleStoreRepository();
const staffRepository = new DrizzleStaffRepository();
const cashierStaffRepository = new DrizzleCashierStaffRepository();
const addressRepository = new DrizzleAddressRepository();
const brandRepository = new DrizzleBrandRepository();
const terminalRepository = new DrizzleTerminalRepository();
const storeProductRepository = new DrizzleStoreProductRepository();
const transactionRepository = new DrizzleTransactionRepository();
const pinRepository = new DrizzlePinRepository();
const permissionRepository = new DrizzlePermissionRepository();
const tokenService = new JwtTokenService(JWT_SECRET);
const runningNumberService = new RunningNumberService();

// Initialize Application Use Cases
const getMerchantsUseCase = new GetMerchantsUseCase(merchantRepository, staffRepository);
const getMerchantDetailUseCase = new GetMerchantDetailUseCase(merchantRepository, staffRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository, staffRepository);
const getProductDetailUseCase = new GetProductDetailUseCase(productRepository, staffRepository);
const getProductFilterMetadataUseCase = new GetProductFilterMetadataUseCase(productRepository, staffRepository);
const createProductUseCase = new CreateProductUseCase(productRepository, merchantRepository, staffRepository);
const bulkCreateProductsUseCase = new BulkCreateProductsUseCase(productRepository, merchantRepository, staffRepository);
const getStoresUseCase = new GetStoresUseCase(storeRepository, merchantRepository, staffRepository);
const getStoreDetailUseCase = new GetStoreDetailUseCase(storeRepository, staffRepository);
const getStaffUseCase = new GetStaffUseCase(cashierStaffRepository, staffRepository, merchantRepository);
const getStaffDetailUseCase = new GetStaffDetailUseCase(cashierStaffRepository, staffRepository);
const getStaffByMerchantUseCase = new GetStaffByMerchantUseCase(cashierStaffRepository, staffRepository, merchantRepository);
const createMerchantUseCase = new CreateMerchantUseCase(merchantRepository, cashierStaffRepository, addressRepository, runningNumberService);
const createMerchantCredentialUseCase = new CreateMerchantCredentialUseCase(merchantRepository);
const rotateMerchantCredentialUseCase = new RotateMerchantCredentialUseCase(merchantRepository);
const getTerminalsByStoreUseCase = new GetTerminalsByStoreUseCase(terminalRepository, storeRepository, staffRepository);
const batchUpsertStoreProductsUseCase = new BatchUpsertStoreProductsUseCase(storeProductRepository, staffRepository);
const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository, staffRepository);
const getTransactionDetailUseCase = new GetTransactionDetailUseCase(transactionRepository, staffRepository);
const loginUseCase = new LoginUseCase(staffRepository, pinRepository, permissionRepository, tokenService, PORTAL_APP_ID);
const getProfileUseCase = new GetProfileUseCase(staffRepository);
const getAddressMasterDataUseCase = new GetAddressMasterDataUseCase(addressRepository);
const batchUpsertBrandsUseCase = new BatchUpsertBrandsUseCase(brandRepository);

// Initialize Presentation Controllers
const authController = new AuthController(loginUseCase, getProfileUseCase);
const merchantController = new MerchantController(getMerchantsUseCase, getMerchantDetailUseCase, createMerchantUseCase, getStaffByMerchantUseCase, createMerchantCredentialUseCase, rotateMerchantCredentialUseCase);
const productController = new ProductController(getProductsUseCase, getProductDetailUseCase, getProductFilterMetadataUseCase, createProductUseCase, bulkCreateProductsUseCase);
const storeController = new StoreController(getStoresUseCase, getStoreDetailUseCase, getTerminalsByStoreUseCase);
const staffController = new StaffController(getStaffUseCase, getStaffDetailUseCase);
const storeProductController = new StoreProductController(batchUpsertStoreProductsUseCase);
const transactionController = new TransactionController(getTransactionsUseCase, getTransactionDetailUseCase);
const masterDataController = new MasterDataController(getAddressMasterDataUseCase);
const brandController = new BrandController(batchUpsertBrandsUseCase);

app.use(cors({ origin: process.env.PORTAL_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(loggerMiddleware);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Public routes
app.use('/api/v1/auth', authRoutes(authController, JWT_SECRET));

// Protected routes (require a valid access token, permission is checked per route)
const protectedApi = Router();
protectedApi.use(serviceAuthMiddleware(JWT_SECRET));
protectedApi.use(merchantRoutes(merchantController));
protectedApi.use(productRoutes(productController));
protectedApi.use(storeProductRoutes(storeProductController));
protectedApi.use(storeRoutes(storeController));
protectedApi.use(staffRoutes(staffController));
protectedApi.use(transactionRoutes(transactionController));
protectedApi.use(masterDataRoutes(masterDataController));
protectedApi.use(brandRoutes(brandController));
app.use('/api/v1', protectedApi);

// Error Handling Middleware (must be after all routes)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
