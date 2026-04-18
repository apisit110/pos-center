export class ExampleEntity {
  constructor(
    public readonly id: string,
    public name: string
  ) {}

  public changeName(newName: string): void {
    this.name = newName;
  }
}
