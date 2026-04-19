import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Repositories
import { DrizzleMerchantRepository } from './infrastructure/repositories/DrizzleMerchantRepository';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';
import { DrizzleStoreRepository } from './infrastructure/repositories/DrizzleStoreRepository';

// Use Cases
import { GetMerchantsUseCase } from './application/use-cases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from './application/use-cases/GetMerchantDetailUseCase';
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase';
import { GetProductDetailUseCase } from './application/use-cases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from './application/use-cases/GetProductFilterMetadataUseCase';
import { GetStoresUseCase } from './application/use-cases/GetStoresUseCase';
import { GetStoreDetailUseCase } from './application/use-cases/GetStoreDetailUseCase';

// Controllers
import { MerchantController } from './infrastructure/controllers/MerchantController';
import { ProductController } from './infrastructure/controllers/ProductController';
import { StoreController } from './infrastructure/controllers/StoreController';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key';

// Initialize Dependencies
const merchantRepository = new DrizzleMerchantRepository();
const productRepository = new DrizzleProductRepository();
const storeRepository = new DrizzleStoreRepository();

const getMerchantsUseCase = new GetMerchantsUseCase(merchantRepository);
const getMerchantDetailUseCase = new GetMerchantDetailUseCase(merchantRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductDetailUseCase = new GetProductDetailUseCase(productRepository);
const getProductFilterMetadataUseCase = new GetProductFilterMetadataUseCase(productRepository);
const getStoresUseCase = new GetStoresUseCase(storeRepository);
const getStoreDetailUseCase = new GetStoreDetailUseCase(storeRepository);

const merchantController = new MerchantController(getMerchantsUseCase, getMerchantDetailUseCase);
const productController = new ProductController(getProductsUseCase, getProductDetailUseCase, getProductFilterMetadataUseCase);
const storeController = new StoreController(getStoresUseCase, getStoreDetailUseCase);

app.use(cors());
app.use(express.json());

app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ uid: 'admin-id-123' }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Merchant Endpoints
app.get('/merchants', (req, res) => merchantController.getAll(req, res));
app.get('/merchants/:id', (req, res) => merchantController.getById(req, res));

// Product Endpoints
app.get('/products', (req, res) => productController.getAll(req, res));
app.get('/products/metadata', (req, res) => productController.getMetadata(req, res));
app.get('/products/:id', (req, res) => productController.getById(req, res));

// Store Endpoints
app.get('/stores', (req, res) => storeController.getAll(req, res));
app.get('/stores/:id', (req, res) => storeController.getById(req, res));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
