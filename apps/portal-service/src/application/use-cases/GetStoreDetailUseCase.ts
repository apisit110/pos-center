import { StoreRepository } from '../repositories/StoreRepository';
import { Store } from '../../domain/entities/Store';

export class GetStoreDetailUseCase {
  constructor(private storeRepository: StoreRepository) {}

  async execute(id: string): Promise<Store | null> {
    return this.storeRepository.getById(id);
  }
}
