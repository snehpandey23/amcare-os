import dotenv from 'dotenv';
import ZohoSync from '../../integrations/zoho-sync/src/index';
import KlaritySync from '../../integrations/klarity-sync/src/index';

dotenv.config();

async function runDailySync() {
  console.log('Starting daily synchronization...');
  const startTime = Date.now();

  try {
    // Sync with Zoho
    console.log('\n=== Syncing with Zoho ===');
    const zohoSync = new ZohoSync();
    await zohoSync.sync();

    // Sync with Klarity
    console.log('\n=== Syncing with Klarity ===');
    const klaritySync = new KlaritySync();
    await klaritySync.sync();

    const duration = Date.now() - startTime;
    console.log(`\n✅ Daily sync completed successfully in ${duration}ms`);
  } catch (error) {
    console.error('\n❌ Daily sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDailySync();
}

export default runDailySync;
