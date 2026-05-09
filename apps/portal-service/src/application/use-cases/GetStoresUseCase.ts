import { IStoreRepository } from '../repositories/IStoreRepository';
import { Store } from '../../domain/entities/Store';

export class GetStoresUseCase {
  constructor(private storeRepository: IStoreRepository) {}

  async execute(): Promise<Store[]> {
    return this.storeRepository.findAll();
  }
}
