import { IStoreRepository } from '../repositories/IStoreRepository';
import { Store } from '../../domain/entities/Store';

export class GetStoreDetailUseCase {
  constructor(private storeRepository: IStoreRepository) {}

  async execute(id: string): Promise<Store | null> {
    return this.storeRepository.getById(id);
  }
}
