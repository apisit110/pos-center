import { Merchant } from '../../domain/entities/Merchant';
import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMerchantRequest {
  name: string;
}

export class CreateMerchantUseCase {
  constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async execute(request: CreateMerchantRequest): Promise<Merchant> {
    const id = uuidv4();
    // Simple mid generation logic
    const mid = 'MID' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const merchant = new Merchant(id, mid, request.name);
    
    await this.merchantRepository.save(merchant);
    
    return merchant;
  }
}
