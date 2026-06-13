import { Store } from '../entities/Store';
import { StoreRepository } from '../repositories/StoreRepository';

export class GetStoreDetailUseCase {
  constructor(private storeRepository: StoreRepository) {}

  async execute(uid: string): Promise<Store | null> {
    return this.storeRepository.getStoreById(uid);
  }
}
