<div align="center">
  <img src="public/akashic-logo.png" alt="Akashic Logo" />
</div>

# 🌍 Akashic

**Akashic** is an open-source platform that helps displaced communities preserve their cultural heritage and fund creative work using Web3 technologies. Refugee creators can upload stories, art, and multimedia—then launch funding campaigns powered by NFTs and smart contracts.

By leveraging decentralized storage (IPFS/Filecoin) and transparent, community-driven funding protocols, Akashic ensures these cultural narratives are owned by the people who create them—and remain accessible across borders and generations.

> Refugees are not just survivors—they are custodians of culture.

## Prerequisites

- [pnpm](https://pnpm.io/) (locked in as the package manager)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for local development only)

## Quick Start (Local Development)

1. **Clone and Install Dependencies:**
   ```bash
   git clone <repository-url>
   cd akashic
   pnpm install
   ```

2. **Set Up Environment Variables:**
   ```bash
   cp env.template .env.local
   ```
   Edit `.env.local` and populate the required variables. Refer to `env.template` for all available options and their descriptions.

3. **Start Development Environment:**
   ```bash
   docker-compose up
   ```
   This will start:
   - PostgreSQL database (accessible at `localhost:5432`)
   - Next.js development server (accessible at [http://localhost:3000](http://localhost:3000))

4. **Initialize Database (in a new terminal):**
   ```bash
   docker-compose exec app pnpm prisma migrate dev
   docker-compose exec app pnpm prisma db seed
   ```

## Database Setup Troubleshooting

If you encounter database-related issues, follow these steps:

1. **Generate Prisma Client:**
   ```bash
   docker-compose exec app pnpm prisma generate
   ```

2. **Apply Migrations:**
   ```bash
   docker-compose exec app pnpm prisma migrate deploy
   ```

3. **Seed Database:**
   ```bash
   docker-compose exec app pnpm prisma db seed
   ```

Common issues and their solutions:
- **Missing Query Engine:** Update `binaryTargets` in `prisma/schema.prisma` and regenerate the client
- **Missing Tables:** Ensure migrations are applied before seeding
- **Seeding Failures:** Verify database is running and migrations are complete
- **Cross-Platform Development:** When developing across different platforms (e.g., Mac M1/M2 and Linux), ensure your `schema.prisma` includes all necessary binary targets:
  ```prisma
  binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-arm64-openssl-3.0.x"]
  ```
- **Database Reset:** If you need to completely reset the database:
  ```bash
  docker-compose down -v  # This removes all volumes
  docker-compose up -d    # Start fresh
  docker-compose exec app pnpm prisma generate  # Generate Prisma client
  docker-compose exec app pnpm prisma migrate dev  # Reapply migrations
  docker-compose exec app pnpm prisma db seed     # Reseed the database
  ```

## Available Scripts

- `pnpm dev` - Start Next.js in development mode
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma ...` - Run Prisma CLI commands

## Docker Commands (Development Only)

- `docker-compose up` - Start development environment
- `docker-compose down` - Stop and cleanup containers

> **Note:** Docker is used for development only. Production deployment uses Vercel.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pnpm Documentation](https://pnpm.io/)

## Production Deployment

The application is deployed on [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For deployment details, see [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
