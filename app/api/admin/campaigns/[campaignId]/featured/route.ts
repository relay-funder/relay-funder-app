import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams, GetCampaignResponse } from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';
import { z } from 'zod';

const PatchFeaturedSchema = z.object({
  mode: z.enum(['toggle', 'set']).default('set').optional(),
  featuredStart: z.string().datetime().nullable().optional(),
  featuredEnd: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: Request, { params }: CampaignsWithIdParams) {
  try {
    await checkAuth(['admin']);
    const { campaignId } = await params;

    // Validate body
    const body = await req.json().catch(() => ({}));
    const parsed = PatchFeaturedSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(', ');
      throw new ApiParameterError(`Invalid request body: ${issues}`);
    }
    const { mode = 'set', featuredStart, featuredEnd } = parsed.data;

    // Load campaign
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Build update payload
    const updateData: {
      featuredStart?: Date | null;
      featuredEnd?: Date | null;
    } = {};

    if (mode === 'toggle') {
      const now = new Date();
      // If currently featured (start set and end not set), toggle off by setting end to now
      // Otherwise, toggle on: start = now, end = null
      if (campaign.featuredStart && !campaign.featuredEnd) {
        updateData.featuredEnd = now;
      } else {
        updateData.featuredStart = now;
        updateData.featuredEnd = null;
      }
    } else {
      // 'set' explicit dates
      let startValue: Date | null | undefined = undefined;
      let endValue: Date | null | undefined = undefined;

      if (typeof featuredStart !== 'undefined') {
        if (featuredStart === null) {
          startValue = null;
        } else {
          const d = new Date(featuredStart);
          if (isNaN(d.getTime())) {
            throw new ApiParameterError(
              'featuredStart must be a valid ISO datetime string or null',
            );
          }
          startValue = d;
        }
      }

      if (typeof featuredEnd !== 'undefined') {
        if (featuredEnd === null) {
          endValue = null;
        } else {
          const d = new Date(featuredEnd);
          if (isNaN(d.getTime())) {
            throw new ApiParameterError(
              'featuredEnd must be a valid ISO datetime string or null',
            );
          }
          endValue = d;
        }
      }

      if (
        typeof startValue === 'undefined' &&
        typeof endValue === 'undefined'
      ) {
        throw new ApiParameterError(
          'At least one of featuredStart or featuredEnd must be provided when mode is set',
        );
      }

      if (startValue instanceof Date && endValue instanceof Date) {
        if (startValue >= endValue) {
          throw new ApiParameterError(
            'featuredStart must be earlier than featuredEnd',
          );
        }
      }

      if (typeof startValue !== 'undefined') {
        updateData.featuredStart = startValue;
      }
      if (typeof endValue !== 'undefined') {
        updateData.featuredEnd = endValue;
      }
    }

    await db.campaign.update({
      where: { id: campaign.id },
      data: updateData,
    });

    return response({
      campaign: await getCampaign(campaign.id),
    } as GetCampaignResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
