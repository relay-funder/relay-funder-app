import { PrismaClient, Prisma } from '@/.generated/prisma/client';
import { IS_PRODUCTION } from '@/lib/constant';

export {
  Decimal,
  PrismaClientKnownRequestError,
} from '@/.generated/prisma/client/runtime/library';
export { Prisma } from '@/.generated/prisma/client';
export type * from '@/.generated/prisma/client';
export { RecipientStatus } from '@/.generated/prisma/client';

const createPrismaClient = () =>
  new PrismaClient({
    log: ['error'],
    transactionOptions: {
      // Maximum time to wait for a transaction to start (acquire connection from pool)
      maxWait: 5000, // 5 seconds
      
      // Maximum time a transaction can run before timing out
      // This prevents indefinite hangs and connection pool exhaustion
      timeout: 180000, // 180 seconds (3 minutes) - matches OVERALL_EXECUTION timeout
      
      // Default isolation level for all transactions
      // ReadCommitted prevents dirty reads while allowing good concurrency
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (!IS_PRODUCTION) globalForPrisma.prisma = db;
