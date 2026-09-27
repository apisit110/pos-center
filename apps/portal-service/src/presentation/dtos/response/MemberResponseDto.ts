import { Member } from '../../../domain/entities/Member';

export interface MemberResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  createdAt: Date;
}

export function toMemberResponseDto(member: Member): MemberResponseDto {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    tier: member.tier,
    points: member.points,
    createdAt: member.createdAt,
  };
}
