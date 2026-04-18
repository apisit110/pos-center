import express, { Request, Response } from 'express';
import cors from 'cors';
import { SyncPOSProductsUseCase } from './application/use-cases/SyncPOSProductsUseCase';
import { HttpPOSProductGateway } from './infrastructure/repositories/HttpPOSProductGateway';
import { MockProductRepository } from './infrastructure/repositories/MockProductRepository';

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Initialize Dependencies
const posGateway = new HttpPOSProductGateway();
const productRepo = new MockProductRepository();
const syncUseCase = new SyncPOSProductsUseCase(posGateway, productRepo);

app.post('/v1/sync/products', async (req: Request, res: Response) => {
  const { merchantId } = req.body;

  if (!merchantId) {
    return res.status(400).json({ message: 'merchantId is required' });
  }

  console.log(`[pos-sync-service] Triggering sync for merchant: ${merchantId}`);
  
  const result = await syncUseCase.execute(merchantId);

  if (result.success) {
    return res.status(200).json({
      message: 'Sync completed successfully',
      syncedCount: result.count
    });
  } else {
    return res.status(500).json({ message: 'Sync failed' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'pos-sync-service' });
});

app.listen(port, () => {
  console.log(`[pos-sync-service]: Server is running at http://localhost:${port}`);
});
