# syntax=docker/dockerfile:1
FROM node:20-slim
WORKDIR /app

# Install system dependencies and clean up
RUN apt-get update -y && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm first
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --home /app && \
    mkdir -p /app/.next /app/node_modules && \
    chown -R nextjs:nodejs /app

# Copy package files
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml* ./

# Install dependencies as nextjs user
USER nextjs
ENV NODE_ENV=development
RUN pnpm install

# Expose port
EXPOSE 3000

CMD ["pnpm", "dev"] 