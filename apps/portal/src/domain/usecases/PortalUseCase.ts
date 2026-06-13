import { PortalEntity } from '../entities/PortalEntity';

export class PortalUseCase {
  constructor() {}

  public async execute(id: string, title: string): Promise<PortalEntity> {
    const entity = new PortalEntity(id, title);
    // Add business logic here
    return entity;
  }
}
