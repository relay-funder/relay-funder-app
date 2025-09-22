import type { Prisma } from '@/.generated/prisma/client';
import { z } from 'zod';
import type { GetCampaignResponse } from '../campaigns';
export type UserWithCount = Prisma.UserGetPayload<{
  include: {
    _count: true;
  };
}>;

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

export const PatchAdminCampaignFeaturedRouteBodySchema = z.object({
  mode: z.enum(['toggle', 'set']).optional(),
  featuredStart: z.string().datetime().nullable().optional(),
  featuredEnd: z.string().datetime().nullable().optional(),
});
export type PatchAdminCampaignFeaturedRouteBody = z.infer<
  typeof PatchAdminCampaignFeaturedRouteBodySchema
>;

export type PatchAdminCampaignFeaturedRouteResponse = GetCampaignResponse;
