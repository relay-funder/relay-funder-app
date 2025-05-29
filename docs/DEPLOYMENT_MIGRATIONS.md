# Vercel Production Migration Setup

Automatic database migrations for Vercel deployments using Prisma and Railway Cloud DB.

## Overview

The migration system automatically:
1. ✅ Checks if migrations need to be run during Vercel deployment
2. ✅ Runs pending migrations before the app starts
3. ✅ Fails deployment safely if migrations fail

## Related Files

- `prisma/deploy-migrations.js` - Migration script that runs during deployment
- `vercel.json` - Vercel configuration

## How It Works

### Deployment Process

1. **Git Push** → Vercel triggers deployment
2. **Generate**: `prisma generate` (via postinstall hook)
3. **Migrate**: `node prisma/deploy-migrations.js`
   - ✅ **Preview (staging) deployments**: Runs migrations
   - ✅ **Production deployments**: Runs migrations  
   - ⏭️ **Local development**: Skips migrations (use `pnpm dev:db`)
4. **Build**: `next build`

### Migration Script Logic

```javascript
1. Check DATABASE_URL is set
2. Test database connectivity
3. Run `prisma migrate status`
4. If pending migrations: run `prisma migrate deploy`
5. Exit with success/failure
```

## Troubleshooting

### Check Deployment Logs
1. Go to Vercel dashboard
2. Click on deployment
3. Check "Build Logs" for migration output
4. Look for 🚀, ✅, or ❌ messages

### Common Issues

**Migration fails:**
- Verify `DATABASE_URL` is correct
- Look for schema conflicts in logs

**Database connection fails:**
- Verify Railway database URL
- Check environment variables in Vercel
