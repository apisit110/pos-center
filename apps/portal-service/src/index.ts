import express, { Request, Response } from 'express';
import cors from 'cors';

// Infrastructure: Repositories & Services
import { DrizzleMerchantRepository } from './infrastructure/repositories/DrizzleMerchantRepository';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleStoreRepository } from './infrastructure/repositories/DrizzleStoreRepository';
import { DrizzleMemberRepository } from './infrastructure/repositories/DrizzleMemberRepository';
import { DrizzleStaffRepository } from './infrastructure/repositories/DrizzleStaffRepository';
import { DrizzleTerminalRepository } from './infrastructure/repositories/DrizzleTerminalRepository';
import { DrizzleStoreProductRepository } from './infrastructure/repositories/DrizzleStoreProductRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';
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
import { GetMembersUseCase } from './application/usecases/GetMembersUseCase';
import { GetMemberDetailUseCase } from './application/usecases/GetMemberDetailUseCase';
import { GetStaffUseCase } from './application/usecases/GetStaffUseCase';
import { GetStaffDetailUseCase } from './application/usecases/GetStaffDetailUseCase';
import { GetStaffByMerchantUseCase } from './application/usecases/GetStaffByMerchantUseCase';
import { RegisterMerchantUseCase } from './application/usecases/RegisterMerchantUseCase';
import { GetTerminalsByStoreUseCase } from './application/usecases/GetTerminalsByStoreUseCase';
import { BatchUpsertStoreProductsUseCase } from './application/usecases/BatchUpsertStoreProductsUseCase';
import { GetTransactionsUseCase } from './application/usecases/GetTransactionsUseCase';

// Presentation: Controllers
import { MerchantController } from './presentation/controllers/MerchantController';
import { ProductController } from './presentation/controllers/ProductController';
import { StoreController } from './presentation/controllers/StoreController';
import { MemberController } from './presentation/controllers/MemberController';
import { StaffController } from './presentation/controllers/StaffController';
import { StoreProductController } from './presentation/controllers/StoreProductController';
import { TransactionController } from './presentation/controllers/TransactionController';

// Presentation: Middleware
import { loggerMiddleware } from './presentation/middleware/LoggerMiddleware';
import { errorMiddleware } from './presentation/middleware/ErrorMiddleware';

// Presentation: Routes
import { authRoutes } from './presentation/routes/auth.routes';
import { merchantRoutes } from './presentation/routes/merchant.routes';
import { productRoutes } from './presentation/routes/product.routes';
import { storeProductRoutes } from './presentation/routes/storeProduct.routes';
import { storeRoutes } from './presentation/routes/store.routes';
import { memberRoutes } from './presentation/routes/member.routes';
import { staffRoutes } from './presentation/routes/staff.routes';
import { transactionRoutes } from './presentation/routes/transaction.routes';

const app = express();
const port = process.env.PORT || 4001;

// Initialize Infrastructure
const merchantRepository = new DrizzleMerchantRepository();
const productRepository = new DrizzleProductRepository();
const storeRepository = new DrizzleStoreRepository();
const memberRepository = new DrizzleMemberRepository();
const staffRepository = new DrizzleStaffRepository();
const terminalRepository = new DrizzleTerminalRepository();
const storeProductRepository = new DrizzleStoreProductRepository();
const transactionRepository = new DrizzleTransactionRepository();
const runningNumberService = new RunningNumberService();

// Initialize Application Use Cases
const getMerchantsUseCase = new GetMerchantsUseCase(merchantRepository);
const getMerchantDetailUseCase = new GetMerchantDetailUseCase(merchantRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductDetailUseCase = new GetProductDetailUseCase(productRepository);
const getProductFilterMetadataUseCase = new GetProductFilterMetadataUseCase(productRepository);
const createProductUseCase = new CreateProductUseCase(productRepository, merchantRepository);
const bulkCreateProductsUseCase = new BulkCreateProductsUseCase(productRepository, merchantRepository);
const getStoresUseCase = new GetStoresUseCase(storeRepository);
const getStoreDetailUseCase = new GetStoreDetailUseCase(storeRepository);
const getMembersUseCase = new GetMembersUseCase(memberRepository);
const getMemberDetailUseCase = new GetMemberDetailUseCase(memberRepository);
const getStaffUseCase = new GetStaffUseCase(staffRepository);
const getStaffDetailUseCase = new GetStaffDetailUseCase(staffRepository);
const getStaffByMerchantUseCase = new GetStaffByMerchantUseCase(staffRepository);
const registerMerchantUseCase = new RegisterMerchantUseCase(merchantRepository, storeRepository, terminalRepository, runningNumberService, staffRepository);
const getTerminalsByStoreUseCase = new GetTerminalsByStoreUseCase(terminalRepository);
const batchUpsertStoreProductsUseCase = new BatchUpsertStoreProductsUseCase(storeProductRepository);
const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);

// Initialize Presentation Controllers
const merchantController = new MerchantController(getMerchantsUseCase, getMerchantDetailUseCase, registerMerchantUseCase, getStaffByMerchantUseCase);
const productController = new ProductController(getProductsUseCase, getProductDetailUseCase, getProductFilterMetadataUseCase, createProductUseCase, bulkCreateProductsUseCase);
const storeController = new StoreController(getStoresUseCase, getStoreDetailUseCase, getTerminalsByStoreUseCase);
const memberController = new MemberController(getMembersUseCase, getMemberDetailUseCase);
const staffController = new StaffController(getStaffUseCase, getStaffDetailUseCase);
const storeProductController = new StoreProductController(batchUpsertStoreProductsUseCase);
const transactionController = new TransactionController(getTransactionsUseCase);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(loggerMiddleware);

// Routes
app.use('/', authRoutes());
app.use('/', merchantRoutes(merchantController));
app.use('/', productRoutes(productController));
app.use('/', storeProductRoutes(storeProductController));
app.use('/', storeRoutes(storeController));
app.use('/', memberRoutes(memberController));
app.use('/', staffRoutes(staffController));
app.use('/', transactionRoutes(transactionController));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handling Middleware (must be after all routes)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
