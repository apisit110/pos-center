import { Member } from '../../domain/entities/Member';
import { MemberFilter, MemberRepository } from '../../application/repositories/MemberRepository';

export class MockMemberRepository implements MemberRepository {
  private members: Member[] = [
    new Member('1', 'John', 'Doe', 'john@example.com', '0812345678', 'Gold', 1500, new Date('2024-01-01')),
    new Member('2', 'Jane', 'Smith', 'jane@example.com', '0823456789', 'Silver', 800, new Date('2024-01-15')),
    new Member('3', 'Bob', 'Johnson', 'bob@example.com', '0834567890', 'Bronze', 200, new Date('2024-02-01')),
    new Member('4', 'Alice', 'Williams', 'alice@example.com', '0845678901', 'Platinum', 5000, new Date('2024-02-10')),
    new Member('5', 'Charlie', 'Brown', 'charlie@example.com', '0856789012', 'Silver', 1200, new Date('2024-03-01')),
    new Member('6', 'David', 'Miller', 'david@example.com', '0867890123', 'Gold', 2500, new Date('2024-03-15')),
    new Member('7', 'Eva', 'Davis', 'eva@example.com', '0878901234', 'Bronze', 50, new Date('2024-04-01')),
    new Member('8', 'Frank', 'Wilson', 'frank@example.com', '0889012345', 'Platinum', 7500, new Date('2024-04-10')),
    new Member('9', 'Grace', 'Taylor', 'grace@example.com', '0890123456', 'Silver', 900, new Date('2024-05-01')),
    new Member('10', 'Henry', 'Anderson', 'henry@example.com', '0901234567', 'Gold', 1800, new Date('2024-05-15')),
    new Member('11', 'Ivy', 'Thomas', 'ivy@example.com', '0912345678', 'Bronze', 300, new Date('2024-06-01')),
    new Member('12', 'Jack', 'White', 'jack@example.com', '0923456789', 'Platinum', 12000, new Date('2024-06-10')),
  ];

  async getMembers(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    let filteredMembers = [...this.members];

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      filteredMembers = filteredMembers.filter(m => 
        m.firstName.toLowerCase().includes(q) || 
        m.lastName.toLowerCase().includes(q) || 
        m.email.toLowerCase().includes(q) || 
        m.phone.includes(q)
      );
    }

    if (filters?.tier && filters.tier.length > 0) {
      filteredMembers = filteredMembers.filter(m => filters.tier?.includes(m.tier));
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      members: filteredMembers.slice(start, end),
      total: filteredMembers.length
    };
  }

  async getMemberById(id: string): Promise<Member | null> {
    return this.members.find(m => m.id === id) || null;
  }
}
