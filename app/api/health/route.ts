// ABOUTME: Health check endpoint for server readiness verification.
// ABOUTME: Used by warmup scripts and load balancers to check if the server is ready.

import { response } from '@/lib/api/response';

export async function GET() {
  return response({ status: 'ok', timestamp: new Date().toISOString() });
}
