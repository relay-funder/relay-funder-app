import { z } from 'zod';
import { countries, categories } from '@/lib/constant';

export const CampaignFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must not be empty' }),
  description: z.string().min(50, { message: 'Description must not be empty' }),
  location: z.enum(countries, {
    errorMap: () => ({
      message: 'Invalid Country selected.',
    }),
  }),
  category: z.enum(
    categories.map(({ id }) => id) as unknown as [string, ...string[]],
    {
      errorMap: () => ({
        message: 'Invalid Category selected.',
      }),
    },
  ),
  bannerImage: z.instanceof(File).or(z.null()).optional(),
});
export type CampaignFormSchemaType = z.infer<typeof CampaignFormSchema>;
