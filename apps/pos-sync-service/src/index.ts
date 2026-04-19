import express, { Request, Response } from 'express';
import cors from 'cors';
import { SyncPOSProductsUseCase } from './application/use-cases/SyncPOSProductsUseCase';
import { DrizzleProductRepository } from './infrastructure/repositories/DrizzleProductRepository';

import { syncProductSchema } from './infrastructure/validation/SyncProductSchema';
import { ZodError } from 'zod';

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Initialize Dependencies
const productRepo = new DrizzleProductRepository();
const syncUseCase = new SyncPOSProductsUseCase(productRepo);

app.post('/v1/sync/products', async (req: Request, res: Response) => {
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
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.issues.map(e => ({ path: e.path, message: e.message })) 
      });
    }
    console.error('[pos-sync-service] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'pos-sync-service' });
});

app.listen(port, () => {
  console.log(`[pos-sync-service]: Server is running at http://localhost:${port}`);
});
