import { ExampleEntity } from '../entities/ExampleEntity';

export class ExampleUseCase {
  constructor() {}

  public async execute(id: string, name: string): Promise<ExampleEntity> {
    const entity = new ExampleEntity(id, name);
    // Add business logic here
    return entity;
  }
}
