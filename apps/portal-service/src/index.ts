import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { loginSchema } from './infrastructure/validation/LoginSchema';

// Repositories
import { DrizzleMerchantRepository } from './infrastructure/repositories/DrizzleMerchantRepository';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleStoreRepository } from './infrastructure/repositories/DrizzleStoreRepository';
import { DrizzleMemberRepository } from './infrastructure/repositories/DrizzleMemberRepository';
import { DrizzleStaffRepository } from './infrastructure/repositories/DrizzleStaffRepository';
import { DrizzleTerminalRepository } from './infrastructure/repositories/DrizzleTerminalRepository';

// Use Cases
import { GetMerchantsUseCase } from './application/use-cases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from './application/use-cases/GetMerchantDetailUseCase';
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase';
import { GetProductDetailUseCase } from './application/use-cases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from './application/use-cases/GetProductFilterMetadataUseCase';
import { CreateProductUseCase } from './application/use-cases/CreateProductUseCase';
import { GetStoresUseCase } from './application/use-cases/GetStoresUseCase';
import { GetStoreDetailUseCase } from './application/use-cases/GetStoreDetailUseCase';
import { GetMembersUseCase } from './application/use-cases/GetMembersUseCase';
import { GetMemberDetailUseCase } from './application/use-cases/GetMemberDetailUseCase';
import { GetStaffUseCase } from './application/use-cases/GetStaffUseCase';
import { GetStaffDetailUseCase } from './application/use-cases/GetStaffDetailUseCase';
import { GetStaffByMerchantUseCase } from './application/use-cases/GetStaffByMerchantUseCase';
import { RegisterMerchantUseCase } from './application/use-cases/RegisterMerchantUseCase';
import { GetTerminalsByStoreUseCase } from './application/use-cases/GetTerminalsByStoreUseCase';
import { BatchUpsertStoreProductsUseCase } from './application/use-cases/BatchUpsertStoreProductsUseCase';
import { GetTransactionsUseCase } from './application/use-cases/GetTransactionsUseCase';

// Controllers
import { MerchantController } from './infrastructure/controllers/MerchantController';
import { ProductController } from './infrastructure/controllers/ProductController';
import { StoreController } from './infrastructure/controllers/StoreController';
import { MemberController } from './infrastructure/controllers/MemberController';
import { StaffController } from './infrastructure/controllers/StaffController';
import { StoreProductController } from './infrastructure/controllers/StoreProductController';
import { TransactionController } from './infrastructure/controllers/TransactionController';
import { DrizzleStoreProductRepository } from './infrastructure/repositories/DrizzleStoreProductRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';

import { loggerMiddleware } from './infrastructure/middleware/LoggerMiddleware';
import { errorMiddleware } from './infrastructure/middleware/ErrorMiddleware';
import { RunningNumberService } from './infrastructure/services/RunningNumberService';

const app = express();
const port = process.env.PORT || 4001;
const JWT_SECRET = 'your-secret-key';

// Initialize Dependencies
const merchantRepository = new DrizzleMerchantRepository();
const productRepository = new DrizzleProductRepository();
const storeRepository = new DrizzleStoreRepository();
const memberRepository = new DrizzleMemberRepository();
const staffRepository = new DrizzleStaffRepository();
const terminalRepository = new DrizzleTerminalRepository();
const storeProductRepository = new DrizzleStoreProductRepository();
const transactionRepository = new DrizzleTransactionRepository();
const runningNumberService = new RunningNumberService();

const getMerchantsUseCase = new GetMerchantsUseCase(merchantRepository);
const getMerchantDetailUseCase = new GetMerchantDetailUseCase(merchantRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductDetailUseCase = new GetProductDetailUseCase(productRepository);
const getProductFilterMetadataUseCase = new GetProductFilterMetadataUseCase(productRepository);
const createProductUseCase = new CreateProductUseCase(productRepository, merchantRepository);
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

const merchantController = new MerchantController(getMerchantsUseCase, getMerchantDetailUseCase, registerMerchantUseCase, getStaffByMerchantUseCase);
const productController = new ProductController(getProductsUseCase, getProductDetailUseCase, getProductFilterMetadataUseCase, createProductUseCase);
const storeController = new StoreController(getStoresUseCase, getStoreDetailUseCase, getTerminalsByStoreUseCase);
const memberController = new MemberController(getMembersUseCase, getMemberDetailUseCase);
const staffController = new StaffController(getStaffUseCase, getStaffDetailUseCase);
const storeProductController = new StoreProductController(batchUpsertStoreProductsUseCase);
const transactionController = new TransactionController(getTransactionsUseCase);

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.post('/login', (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ uid: 'admin-id-123' }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Merchant Endpoints
app.get('/merchants', (req, res, next) => merchantController.getAll(req, res, next));
app.get('/merchants/:id/staff', (req, res, next) => merchantController.getStaff(req, res, next));
app.get('/merchants/:id', (req, res, next) => merchantController.getById(req, res, next));
app.post('/merchants', (req, res, next) => merchantController.register(req, res, next));

// Product Endpoints
app.get('/products', (req, res, next) => productController.getAll(req, res, next));
app.get('/products/metadata', (req, res, next) => productController.getMetadata(req, res, next));
app.post('/products/batch', (req, res, next) => productController.batchCreate(req, res, next));
app.post('/products', (req, res, next) => productController.create(req, res, next));
app.get('/products/:id', (req, res, next) => productController.getById(req, res, next));
app.post('/store-products/batch', (req, res, next) => storeProductController.batchCreate(req, res, next));

// Store Endpoints
app.get('/stores', (req, res, next) => storeController.getAll(req, res, next));
app.get('/stores/:id', (req, res, next) => storeController.getById(req, res, next));
app.get('/stores/:id/terminals', (req, res, next) => storeController.getTerminals(req, res, next));

// Member Endpoints
app.get('/members', (req, res, next) => memberController.getAll(req, res, next));
app.get('/members/:id', (req, res, next) => memberController.getById(req, res, next));

// Staff Endpoints
app.get('/staff', (req, res, next) => staffController.getAll(req, res, next));
app.get('/staff/:id', (req, res, next) => staffController.getById(req, res, next));

// Transaction Endpoints
app.get('/transactions', (req, res, next) => transactionController.getAll(req, res, next));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handling Middleware (must be after all routes)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
