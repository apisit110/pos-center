export class PortalEntity {
  constructor(
    public readonly id: string,
    public title: string
  ) {}

  public changeTitle(newTitle: string): void {
    this.title = newTitle;
  }
}
