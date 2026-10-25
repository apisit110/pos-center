import { db, provinces, districts, subDistricts, postalCodes } from '@pos-center/database';
import { and, asc, eq } from 'drizzle-orm';
import { MasterDataRef } from '../../domain/entities/Store';
import { AddressInput, IAddressRepository, ResolveAddressResult } from '../../domain/repositories/IAddressRepository';

const notFound = (field: string): ResolveAddressResult => ({ ok: false, field, message: 'not found' });
const notMatch = (field: string, parent: string): ResolveAddressResult => ({ ok: false, field, message: `does not belong to ${parent}` });

type MasterDataRow = { code: string | null; nameTh: string | null; nameEn: string | null };

const toMasterDataRefs = (rows: MasterDataRow[]): MasterDataRef[] =>
  rows.filter((r) => r.code).map((r) => ({ code: r.code!, nameTh: r.nameTh ?? '', nameEn: r.nameEn ?? '' }));

export class DrizzleAddressRepository implements IAddressRepository {
  async listProvinces(): Promise<MasterDataRef[]> {
    const rows = await db.select({ code: provinces.code, nameTh: provinces.nameTh, nameEn: provinces.nameEn })
      .from(provinces)
      .orderBy(asc(provinces.nameTh));
    return toMasterDataRefs(rows);
  }

  async listDistricts(provinceCode: string): Promise<MasterDataRef[]> {
    const rows = await db.select({ code: districts.code, nameTh: districts.nameTh, nameEn: districts.nameEn })
      .from(districts)
      .innerJoin(provinces, eq(districts.provinceId, provinces.id))
      .where(eq(provinces.code, provinceCode))
      .orderBy(asc(districts.nameTh));
    return toMasterDataRefs(rows);
  }

  async listSubDistricts(districtCode: string): Promise<MasterDataRef[]> {
    const rows = await db.select({ code: subDistricts.code, nameTh: subDistricts.nameTh, nameEn: subDistricts.nameEn })
      .from(subDistricts)
      .innerJoin(districts, eq(subDistricts.districtId, districts.id))
      .where(eq(districts.code, districtCode))
      .orderBy(asc(subDistricts.nameTh));
    return toMasterDataRefs(rows);
  }

  async listPostalCodes(subDistrictCode: string): Promise<string[]> {
    const rows = await db.select({ code: postalCodes.code })
      .from(postalCodes)
      .innerJoin(subDistricts, eq(postalCodes.subDistrictId, subDistricts.id))
      .where(eq(subDistricts.code, subDistrictCode))
      .orderBy(asc(postalCodes.code));
    return rows.flatMap((r) => (r.code ? [r.code] : []));
  }

  async resolve(input: AddressInput): Promise<ResolveAddressResult> {
    const [province] = await db.select({ id: provinces.id }).from(provinces).where(eq(provinces.code, input.provinceCode)).limit(1);
    if (!province) return notFound('province_code');

    const [district] = await db.select({ id: districts.id, provinceId: districts.provinceId })
      .from(districts).where(eq(districts.code, input.districtCode)).limit(1);
    if (!district) return notFound('district_code');
    if (district.provinceId !== province.id) return notMatch('district_code', 'province_code');

    const [subDistrict] = await db.select({ id: subDistricts.id, districtId: subDistricts.districtId })
      .from(subDistricts).where(eq(subDistricts.code, input.subDistrictCode)).limit(1);
    if (!subDistrict) return notFound('sub_district_code');
    if (subDistrict.districtId !== district.id) return notMatch('sub_district_code', 'district_code');

    // A postal code is shared by several sub districts (one row each), so match the row of this sub district
    const [postalCode] = await db.select({ id: postalCodes.id })
      .from(postalCodes)
      .where(and(eq(postalCodes.code, input.postalCode), eq(postalCodes.subDistrictId, subDistrict.id)))
      .limit(1);
    if (!postalCode) {
      const [anyPostalCode] = await db.select({ id: postalCodes.id }).from(postalCodes).where(eq(postalCodes.code, input.postalCode)).limit(1);
      return anyPostalCode ? notMatch('postal_code', 'sub_district_code') : notFound('postal_code');
    }

    return {
      ok: true,
      address: {
        provinceId: province.id,
        districtId: district.id,
        subDistrictId: subDistrict.id,
        postalCodeId: postalCode.id,
        address1: input.address1 || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      },
    };
  }
}
