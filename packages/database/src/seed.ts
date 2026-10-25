import { seedRunningNumbers } from './seeds/runningNumbers.seed';
import { seedSyncMetadata } from './seeds/syncMetadata.seed';
import { seedPermissions } from './seeds/permissions.seed';
import { seedUamRoles } from './seeds/uamRoles.seed';
import { seedAdminStaff } from './seeds/adminStaff.seed';
import { seedCashierUam } from './seeds/cashierUam.seed';
import { seedThaiAddress } from './seeds/thaiAddress.seed';
import { resetSequences } from './seeds/sequences.seed';

async function seed() {
  console.log('🌱 Setting up initial system data...');

  try {
    // seed default setting
    await seedRunningNumbers();
    await seedSyncMetadata();

    // seed master data
    await seedThaiAddress();

    // seed center staff
    await seedPermissions();
    await seedUamRoles();
    await seedAdminStaff();

    // seed cashier staff roles
    await seedCashierUam();

    await resetSequences();

    console.log('✅ System setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ System setup failed:', error);
    process.exit(1);
  }
}

seed();
