import { StoreRepository } from '../repositories/StoreRepository';
import { Store } from '../../domain/entities/Store';

export class GetStoresUseCase {
  constructor(private storeRepository: StoreRepository) {}

  async execute(): Promise<Store[]> {
    return this.storeRepository.findAll();
  }
}
