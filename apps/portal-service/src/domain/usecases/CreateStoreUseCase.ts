import { Store } from '../entities/Store';
import { IStoreRepository } from '../repositories/IStoreRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateStoreRequest {
  merchantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export class CreateStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  public async execute(request: CreateStoreRequest): Promise<Store> {
    const id = uuidv4();
    // Simple sid generation logic
    const sid = 'SID' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const store = new Store(
      id,
      sid,
      request.merchantId,
      request.name,
      request.address,
      request.latitude,
      request.longitude
    );
    
    await this.storeRepository.save(store);
    
    return store;
  }
}
