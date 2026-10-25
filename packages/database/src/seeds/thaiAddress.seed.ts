import { db } from '../index';
import { provinces, districts, subDistricts, postalCodes } from '@pos-center/models';
import data from './data/thaiAddress.json';

// Source: https://github.com/kongvut/thai-province-data (see docs/data/thai-province-data.xlsx)
const CHUNK_SIZE = 1000;

async function insertInChunks<T>(rows: T[], insert: (chunk: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    await insert(rows.slice(i, i + CHUNK_SIZE));
  }
}

export async function seedThaiAddress() {
  console.log('📦 Seeding provinces, districts, sub districts and postal codes...');

  await insertInChunks(data.provinces, (chunk) =>
    db.insert(provinces).values(chunk).onConflictDoNothing()
  );

  await insertInChunks(data.districts, (chunk) =>
    db.insert(districts).values(chunk).onConflictDoNothing()
  );

  await insertInChunks(
    data.subDistricts.map(({ zipCode, ...subDistrict }) => subDistrict),
    (chunk) => db.insert(subDistricts).values(chunk).onConflictDoNothing()
  );

  await insertInChunks(
    data.subDistricts
      .filter((subDistrict) => subDistrict.zipCode)
      .map((subDistrict) => ({ subDistrictId: subDistrict.id, code: subDistrict.zipCode })),
    (chunk) => db.insert(postalCodes).values(chunk).onConflictDoNothing()
  );
}
