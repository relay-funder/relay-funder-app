// ABOUTME: Development warmup script that preloads all pages and warms database connections.
// ABOUTME: Only runs in development/staging environments, never in production.

import { PrismaClient } from '../.generated/prisma/client';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.WARMUP_BASE_URL || 'http://localhost:3000';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;
const REQUEST_DELAY_MS = 50;

interface WarmupResult {
  route: string;
  status: number | 'error';
  timeMs: number;
}

async function checkEnvironment(): Promise<boolean> {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    console.log('⏭️  Skipping warmup in production environment');
    return false;
  }
  console.log(`🔥 Starting warmup in ${env || 'development'} environment`);
  return true;
}

async function waitForServer(): Promise<boolean> {
  console.log(`⏳ Waiting for server at ${BASE_URL}...`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        console.log('✅ Server is ready');
        return true;
      }
    } catch {
      // Server not ready yet
    }

    if (i < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAY_MS);
      process.stdout.write('.');
    }
  }

  console.log('\n❌ Server did not become ready in time');
  return false;
}

async function warmDatabase(): Promise<{
  campaignSlugs: string[];
  collectionIds: (string | number)[];
  roundIds: (string | number)[];
  userIds: (string | number)[];
}> {
  console.log('🗄️  Warming database connection pool...');

  const prisma = new PrismaClient();

  try {
    const [campaigns, collections, rounds, users] = await Promise.all([
      prisma.campaign.findMany({
        take: 5,
        where: { status: 'ACTIVE' },
        select: { slug: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.collection.findMany({
        take: 3,
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.round.findMany({
        take: 3,
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        take: 3,
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    console.log(
      `   Found ${campaigns.length} campaigns, ${collections.length} collections, ${rounds.length} rounds, ${users.length} users`
    );

    return {
      campaignSlugs: campaigns.map((c) => c.slug),
      collectionIds: collections.map((c) => c.id),
      roundIds: rounds.map((r) => r.id),
      userIds: users.map((u) => u.id),
    };
  } finally {
    await prisma.$disconnect();
  }
}

function scanRoutes(appDir: string): string[] {
  const routes: string[] = [];

  function scan(dir: string, routePath: string = '') {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip private folders, api routes, and special Next.js folders
        if (
          entry.startsWith('_') ||
          entry.startsWith('.') ||
          entry === 'api'
        ) {
          continue;
        }

        // Handle route groups (parentheses) - they don't add to the URL
        const newRoutePath = entry.startsWith('(')
          ? routePath
          : `${routePath}/${entry}`;

        scan(fullPath, newRoutePath);
      } else if (entry === 'page.tsx' || entry === 'page.ts') {
        // Found a page route
        const route = routePath || '/';
        routes.push(route);
      }
    }
  }

  scan(appDir);
  return routes;
}

function categorizeRoutes(routes: string[]): {
  static: string[];
  dynamic: { pattern: string; paramName: string }[];
} {
  const staticRoutes: string[] = [];
  const dynamicRoutes: { pattern: string; paramName: string }[] = [];

  for (const route of routes) {
    const dynamicMatch = route.match(/\[([^\]]+)\]/);
    if (dynamicMatch) {
      dynamicRoutes.push({
        pattern: route,
        paramName: dynamicMatch[1],
      });
    } else {
      staticRoutes.push(route);
    }
  }

  return { static: staticRoutes, dynamic: dynamicRoutes };
}

function buildDynamicUrls(
  dynamicRoutes: { pattern: string; paramName: string }[],
  ids: {
    campaignSlugs: string[];
    collectionIds: (string | number)[];
    roundIds: (string | number)[];
    userIds: (string | number)[];
  }
): string[] {
  const urls: string[] = [];

  for (const { pattern, paramName } of dynamicRoutes) {
    let values: (string | number)[] = [];

    // Map parameter names to available IDs
    if (paramName === 'slug' || paramName === 'campaignId') {
      values = ids.campaignSlugs;
    } else if (paramName === 'id') {
      // Determine type from route pattern
      if (pattern.includes('/collections/')) {
        values = ids.collectionIds;
      } else if (pattern.includes('/rounds/')) {
        values = ids.roundIds;
      } else if (pattern.includes('/users/')) {
        values = ids.userIds;
      } else {
        // Default to first available
        values = ids.campaignSlugs.length > 0 ? ids.campaignSlugs : [1];
      }
    }

    // Generate URLs for each available ID (up to 2 per route)
    const valuesToUse = values.slice(0, 2);
    if (valuesToUse.length === 0) {
      // Use a placeholder if no real IDs available
      valuesToUse.push('warmup-placeholder');
    }

    for (const value of valuesToUse) {
      const url = pattern.replace(`[${paramName}]`, String(value));
      // Handle nested dynamic segments
      if (!url.includes('[')) {
        urls.push(url);
      }
    }
  }

  return urls;
}

async function warmRoute(route: string): Promise<WarmupResult> {
  const url = `${BASE_URL}${route}`;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Warmup-Script/1.0',
        Accept: 'text/html,application/json',
      },
    });

    return {
      route,
      status: response.status,
      timeMs: Date.now() - start,
    };
  } catch {
    return {
      route,
      status: 'error',
      timeMs: Date.now() - start,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWarmup(): Promise<void> {
  // Check environment
  if (!(await checkEnvironment())) {
    return;
  }

  // Wait for server
  if (!(await waitForServer())) {
    process.exit(1);
  }

  // Warm database and get IDs
  const ids = await warmDatabase();

  // Scan routes
  const appDir = join(process.cwd(), 'app');
  const allRoutes = scanRoutes(appDir);
  const { static: staticRoutes, dynamic: dynamicRoutes } =
    categorizeRoutes(allRoutes);

  console.log(
    `📍 Found ${staticRoutes.length} static routes, ${dynamicRoutes.length} dynamic route patterns`
  );

  // Build all URLs to warm
  const dynamicUrls = buildDynamicUrls(dynamicRoutes, ids);
  const allUrls = [...staticRoutes, ...dynamicUrls];

  console.log(`🚀 Warming ${allUrls.length} URLs...\n`);

  // Warm all routes
  const results: WarmupResult[] = [];
  for (const url of allUrls) {
    const result = await warmRoute(url);
    results.push(result);

    const statusIcon =
      result.status === 200
        ? '✓'
        : result.status === 'error'
          ? '✗'
          : `${result.status}`;
    console.log(
      `   ${statusIcon} ${result.route} (${result.timeMs}ms)`
    );

    // Small delay to avoid overwhelming the server
    await sleep(REQUEST_DELAY_MS);
  }

  // Summary
  const successful = results.filter((r) => r.status === 200).length;
  const authRequired = results.filter(
    (r) => r.status === 401 || r.status === 403
  ).length;
  const notFound = results.filter((r) => r.status === 404).length;
  const errors = results.filter((r) => r.status === 'error').length;
  const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0);

  console.log('\n📊 Warmup Summary:');
  console.log(`   ✓ Successful: ${successful}`);
  console.log(`   🔐 Auth required: ${authRequired}`);
  console.log(`   ⚠️  Not found: ${notFound}`);
  console.log(`   ✗ Errors: ${errors}`);
  console.log(`   ⏱️  Total time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log('\n🔥 Warmup complete!');
}

// Run the warmup
runWarmup().catch((error) => {
  console.error('Warmup failed:', error);
  process.exit(1);
});
