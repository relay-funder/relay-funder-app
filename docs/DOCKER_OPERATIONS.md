# Docker Operations Guide

This project uses Docker for all development operations. **NEVER run pnpm or Node.js commands directly on the host system.**

## Docker Services

The development environment includes multiple Docker services:
- **app**: Main Next.js application with hot reloading
- **database**: PostgreSQL database with health checks
- **pgadmin**: Database administration interface
- **app-shell**: Shell access for advanced development tasks
- **app-trace**: Turbopack trace server for performance debugging

## Starting the Environment

```bash
# Start development environment
docker compose up

# Start in detached mode
docker compose up -d

# Stop development environment
docker compose down
```

## Package Management

```bash
# Install dependencies
docker compose exec app pnpm install

# Add new dependencies
docker compose exec app pnpm add <package-name>
docker compose exec app pnpm add -D <dev-package-name>

# Remove dependencies
docker compose exec app pnpm remove <package-name>

# Update dependencies
docker compose exec app pnpm update
```

## Development Commands

```bash
# Run development server
docker compose exec app pnpm dev

# Build application
docker compose exec app pnpm build

# Start production server
docker compose exec app pnpm start

# Run tests
docker compose exec app pnpm test

# Type checking
docker compose exec app pnpm type-check

# Linting
docker compose exec app pnpm lint

# Format code
docker compose exec app pnpm format:write
```

## Shell Access

```bash
# Primary development shell (most common)
docker compose exec app bash

# Alternative shell for advanced tasks
docker compose exec app-shell bash

# Run single commands without entering shell
docker compose exec app <command>
```

## Container Status and Debugging

```bash
# Check container status
docker compose ps

# View container logs
docker compose logs app
docker compose logs database
docker compose logs pgadmin

# Follow logs in real-time
docker compose logs -f app

# Restart specific service
docker compose restart app
docker compose restart database

# Full restart
docker compose down
docker compose up
```

## Database Operations

```bash
# Generate Prisma client
docker compose exec app pnpm prisma generate

# Run database migrations
docker compose exec app pnpm dev:db

# Run migrations in development
docker compose exec app pnpm prisma migrate dev

# Check migration status
docker compose exec app pnpm migrate:check

# Seed database
docker compose exec app pnpm dev:db:seed

# Reset database (development only)
docker compose exec app pnpm prisma migrate reset

# Database inspection and debugging
docker compose exec app pnpm prisma studio
docker compose exec app pnpm prisma db push
docker compose exec app pnpm prisma db pull
```

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker compose logs app

# Rebuild containers
docker compose build --no-cache
docker compose up
```

### Database connection issues
```bash
# Check database is running
docker compose ps database

# View database logs
docker compose logs database

# Restart database
docker compose restart database
```

### Port conflicts
```bash
# Check what's using a port
lsof -i :3000

# Stop all containers and restart
docker compose down
docker compose up
```
