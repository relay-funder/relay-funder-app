import { z } from 'zod';

export const PaginatedResponseSchema = z.object({
  pagination: z.object({
    currentPage: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    hasMore: z.boolean(),
  }),
});
export const PaginatedRequestSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
});

// Email validation schema - reusable across the application
export const EmailSchema = z.string().email();

export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
