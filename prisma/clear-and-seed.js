/**
 * Clear and Seed Database Script
 *
 * This script completely clears the database and reseeds it with fresh data.
 * Useful for staging environments and testing.
 *
 * Usage:
 * - Via npm script: pnpm run staging:clear-and-seed
 * - Via docker: docker compose exec app pnpm run staging:clear-and-seed
 */

import { PrismaClient } from '../.generated/prisma/client/index.js';
import { execSync } from 'child_process';

const db = new PrismaClient({
  log: ['error', 'warn'],
});

async function clearDatabase() {
  console.log('🧹 Clearing existing database data...');

  try {
    // Clear in dependency order (foreign key constraints)
    await db.roundContribution.deleteMany();
    await db.roundCampaigns.deleteMany();
    await db.campaignCollection.deleteMany();
    await db.collection.deleteMany();
    await db.favorite.deleteMany();
    await db.payment.deleteMany();
    await db.paymentMethod.deleteMany();
    await db.comment.deleteMany();
    await db.withdrawal.deleteMany();
    await db.media.deleteMany();
    await db.campaignUpdate.deleteMany();
    await db.campaignImage.deleteMany();
    await db.campaign.deleteMany();
    await db.round.deleteMany();
    await db.user.deleteMany();

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function resetSequences() {
  console.log('🔄 Resetting auto-increment sequences...');

  try {
    // Reset sequences for auto-increment fields
    const resetQueries = [
      'ALTER SEQUENCE "User_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Campaign_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Round_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Payment_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "PaymentMethod_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "CampaignUpdate_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "CampaignImage_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Favorite_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "RoundCampaigns_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "RoundContribution_id_seq" RESTART WITH 1;',
      'ALTER SEQUENCE "Withdrawal_id_seq" RESTART WITH 1;',
    ];

    for (const query of resetQueries) {
      try {
        await db.$executeRawUnsafe(query);
      } catch (err) {
        // Ignore errors for sequences that don't exist
        console.warn(`⚠️  Sequence reset warning: ${err.message}`);
      }
    }

    console.log('✅ Sequences reset successfully');
  } catch (error) {
    console.error('❌ Error resetting sequences:', error);
    // Don't throw - this is not critical
  }
}

async function runSeedScript() {
  console.log('🌱 Running seed script...');

  try {
    // Run the existing seed script using pnpm
    execSync('pnpm prisma db seed', { stdio: 'inherit' });
    console.log('✅ Seed script completed successfully');
  } catch (error) {
    console.error('❌ Error running seed script:', error);
    throw error;
  }
}

async function main() {
  const startTime = Date.now();

  console.log('🚀 Starting database clear and reseed process...');
  console.log(
    '📊 Target database:',
    process.env.DATABASE_URL ? 'Remote staging database' : 'Local database',
  );

  try {
    // Step 1: Clear all data
    await clearDatabase();

    // Step 2: Reset sequences
    await resetSequences();

    // Step 3: Run seed script
    await runSeedScript();

    const duration = (Date.now() - startTime) / 1000;
    console.log(
      `🎉 Database clear and reseed completed successfully in ${duration.toFixed(2)}s`,
    );
  } catch (error) {
    console.error('💥 Clear and reseed process failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted, cleaning up...');
  await db.$disconnect();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated, cleaning up...');
  await db.$disconnect();
  process.exit(1);
});

main().catch(async (error) => {
  console.error('💥 Unhandled error:', error);
  await db.$disconnect();
  process.exit(1);
});
