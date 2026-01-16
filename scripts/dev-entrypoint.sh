#!/bin/bash
# ABOUTME: Docker entrypoint that starts dev server and runs warmup after health check.
# ABOUTME: Ensures warmup runs on every container start/restart.

set -e

# Start dev server in background
pnpm dev &
DEV_PID=$!

# Run warmup in background after server is healthy
(
  echo "⏳ Waiting for server health before warmup..."

  # Wait for health check to pass
  until curl -sf http://localhost:3000/api/health > /dev/null 2>&1; do
    sleep 2
  done

  echo "✅ Server healthy, starting warmup..."
  pnpm warmup
) &

# Wait for dev server (keeps container running)
wait $DEV_PID
