import type { Prisma } from '@/.generated/prisma/client';
import { z } from 'zod';
export type UserWithCount = Prisma.UserGetPayload<
  Prisma.UserDefaultArgs & {
    include: {
      _count: {
        select: {
          collections: true;
          payments: true;
          paymentMethods: true;
          createdMedia: true;
          withdrawals: true;
          approvals: true;
        };
      };
    };
  }
>;

export interface UserWithAddressParams {
  params: Promise<{
    address: string;
  }>;
}
export interface GetUserResponseInstance extends UserWithCount {}
export interface GetUserResponse {
  user: GetUserResponseInstance;
}

export const PatchUserRouteBodySchema = z.object({
  email: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || (val.trim() !== '' && val.includes('@')),
      {
        message: "Must be a non-empty string containing '@' if provided",
      },
    ),
  username: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || (val.trim() !== '' && val.length > 4),
      {
        message: 'Must be a non-empty string at least 4 characters long',
      },
    ),
  firstName: z.string().optional().or(z.null()),
  lastName: z.string().optional().or(z.null()),
  bio: z.string().optional().or(z.null()),
  recipientWallet: z.string().optional().or(z.null()),
  isKycCompleted: z.boolean().optional().or(z.null()),
});
export type PatchUserRouteBody = z.infer<typeof PatchUserRouteBodySchema>;
