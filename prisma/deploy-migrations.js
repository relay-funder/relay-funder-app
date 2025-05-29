#!/usr/bin/env node

/**
 * Production Migration Script for Vercel Deployment
 * 
 * This script:
 * 1. Checks if there are pending migrations
 * 2. Runs migrations if needed during deployment
 * 3. Handles errors gracefully
 * 
 * Note: Prisma client generation is handled by postinstall hook
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isVercelBuild = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV;
const databaseUrl = process.env.DATABASE_URL;

console.log('🚀 Migration script starting...');
console.log(`Environment: ${process.env.NODE_ENV || 'unknown'} | Vercel: ${vercelEnv || 'local'}`);

async function runCommand(command, description) {
  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd: projectRoot,
      env: { ...process.env },
      timeout: 15000 // 15 second timeout
    });
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) {
      console.warn('⚠️  Warning:', stderr);
    }
    
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    if (error.stdout) console.error('STDOUT:', error.stdout);
    if (error.stderr) console.error('STDERR:', error.stderr);
    return { success: false, error };
  }
}

async function checkDatabaseConnection() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  console.log('🔌 Checking database and migrations...');
  
  // Simpler connectivity test using Prisma's built-in validation
  const result = await runCommand(
    'pnpm exec prisma migrate status --schema=./prisma/schema.prisma',
    'Database connection'
  );
  
  if (!result.success) {
    throw new Error('Cannot connect to database. Please check DATABASE_URL and database availability.');
  }
  
  return result;
}

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...');
  
  // We already did this check in checkDatabaseConnection, so we can reuse that result
  // But let's be explicit about what we're checking for
  const result = await runCommand(
    'pnpm exec prisma migrate status --schema=./prisma/schema.prisma',
    'Checking migration status'
  );
  
  if (!result.success) {
    // If migrate status fails, assume we need to deploy migrations
    return { needsMigration: true, reason: 'migrate status command failed' };
  }
  
  // Check if output indicates pending migrations
  const output = result.stdout.toLowerCase();
  const hasPendingMigrations = 
    output.includes('pending') || 
    output.includes('not yet applied') ||
    output.includes('database is not up to date') ||
    output.includes('following migration') ||
    output.includes('drift');
  
  return { 
    needsMigration: hasPendingMigrations, 
    reason: hasPendingMigrations ? 'pending migrations detected' : 'database up to date',
    output: result.stdout 
  };
}

async function runMigrations() {
  const result = await runCommand(
    'pnpm exec prisma migrate deploy --schema=./prisma/schema.prisma',
    'Migration deployment'
  );
  
  if (!result.success) {
    throw new Error('Migration deployment failed');
  }
  
  return result;
}

async function main() {
  try {
    // Skip in local development unless explicitly requested
    if (isDevelopment && !process.env.FORCE_PRODUCTION_MIGRATIONS) {
      console.log('⏭️  Skipping migrations in development (use "pnpm dev:db" for local migrations)');
      return;
    }
    
    // Combined database connection and initial migration status check
    const connectionResult = await checkDatabaseConnection();
    
    // Parse the connection result to see if we already have migration info
    const output = connectionResult.stdout.toLowerCase();
    const hasPendingMigrations = 
      output.includes('pending') || 
      output.includes('not yet applied') ||
      output.includes('database is not up to date') ||
      output.includes('following migration') ||
      output.includes('drift');
    
    if (hasPendingMigrations) {
      console.log('🔄 Running pending migrations...');
      await runMigrations();
      console.log('✅ Migrations completed');
    } else {
      console.log('✅ Database up to date');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    
    // In Vercel builds, we want to fail the deployment if migrations fail
    if (isVercelBuild) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main();
