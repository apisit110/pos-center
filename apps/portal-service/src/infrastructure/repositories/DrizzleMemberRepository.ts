import { db, members } from '@lightning/database';
import { eq, or, like, sql, count } from 'drizzle-orm';
import { Member } from '../../domain/entities/Member';
import { IMemberRepository, MemberFilter } from '../../application/repositories/IMemberRepository';

export class DrizzleMemberRepository implements IMemberRepository {
  async getMembers(page: number, limit: number, filters?: MemberFilter): Promise<{ members: Member[], total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause: any = undefined;
    
    if (filters?.query) {
      whereClause = or(
        like(members.firstName, `%${filters.query}%`),
        like(members.lastName, `%${filters.query}%`),
        like(members.email, `%${filters.query}%`),
        like(members.phone, `%${filters.query}%`)
      );
    }
    
    if (filters?.tier) {
      const tierFilter = eq(members.tier, filters.tier);
      whereClause = whereClause ? sql`${whereClause} AND ${tierFilter}` : tierFilter;
    }

    const results = await db.select().from(members)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(members).where(whereClause);

    return {
      members: results.map(m => new Member(
        m.uid,
        m.firstName,
        m.lastName,
        m.email,
        m.phone,
        m.tier as any,
        m.points,
        m.createdAt || new Date()
      )),
      total: Number(totalCount[0].value)
    };
  }

  async getMemberById(id: string): Promise<Member | null> {
    const result = await db.select().from(members).where(eq(members.uid, id)).limit(1);
    if (!result[0]) return null;
    
    const m = result[0];
    return new Member(
      m.uid,
      m.firstName,
      m.lastName,
      m.email,
      m.phone,
      m.tier as any,
      m.points,
      m.createdAt || new Date()
    );
  }
}
