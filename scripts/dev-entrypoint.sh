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

  # Wait for health check to pass (with timeout)
  MAX_WAIT_SECONDS=120
  waited=0
  until curl -sf --max-time 2 http://localhost:3000/api/health > /dev/null 2>&1; do
    sleep 2
    waited=$((waited + 2))
    if [ "$waited" -ge "$MAX_WAIT_SECONDS" ]; then
      echo "❌ Health check timed out after ${MAX_WAIT_SECONDS}s, skipping warmup"
      exit 0
    fi
  done

  echo "✅ Server healthy, starting warmup..."
  pnpm warmup
) &

# Wait for dev server (keeps container running)
wait $DEV_PID
