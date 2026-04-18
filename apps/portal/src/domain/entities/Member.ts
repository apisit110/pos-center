export class Member {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
    public readonly points: number,
    public readonly createdAt: Date
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
