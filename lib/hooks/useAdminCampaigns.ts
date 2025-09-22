import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY, resetCampaign } from '@/lib/hooks/useCampaigns';
import type {
  PatchAdminCampaignFeaturedRouteBody,
  PatchAdminCampaignFeaturedRouteResponse,
} from '@/lib/api/types/admin';

interface UpdateCampaignFeaturedVariables
  extends PatchAdminCampaignFeaturedRouteBody {
  campaignId: number;
}

interface ToggleCampaignFeaturedVariables {
  campaignId: number;
}

interface SetCampaignFeaturedDatesVariables {
  campaignId: number;
  featuredStart?: string | null;
  featuredEnd?: string | null;
}

async function patchAdminCampaignFeatured({
  campaignId,
  ...body
}: UpdateCampaignFeaturedVariables) {
  const response = await fetch(`/api/admin/campaigns/${campaignId}/featured`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to update campaign featured dates';
    try {
      const err = await response.json();
      errorMsg = err?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const result =
    (await response.json()) as PatchAdminCampaignFeaturedRouteResponse;
  return result;
}

/**
 * Generic admin hook to update campaign featured settings.
 * Accepts:
 * - mode: 'toggle' | 'set'
 * - featuredStart?: ISO string | null
 * - featuredEnd?: ISO string | null
 */
export function useAdminUpdateCampaignFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateCampaignFeaturedVariables) =>
      patchAdminCampaignFeatured(variables),
    onSuccess: (data) => {
      // Invalidate all campaign-related queries and reset the specific campaign
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      const id = data?.campaign?.id;
      if (typeof id === 'number') {
        resetCampaign(id, queryClient);
      }
    },
  });
}

/**
 * Convenience hook: Toggle featured state.
 * - If currently featured (start set and end not set) => sets featuredEnd to now
 * - Else => sets featuredStart to now and clears featuredEnd
 */
export function useAdminToggleCampaignFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId }: ToggleCampaignFeaturedVariables) =>
      patchAdminCampaignFeatured({
        campaignId,
        mode: 'toggle',
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      const id = data?.campaign?.id;
      if (typeof id === 'number') {
        resetCampaign(id, queryClient);
      }
    },
  });
}

/**
 * Convenience hook: Set explicit featured start/end dates.
 * Provide ISO strings or null to clear.
 */
export function useAdminSetCampaignFeaturedDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      featuredStart,
      featuredEnd,
    }: SetCampaignFeaturedDatesVariables) =>
      patchAdminCampaignFeatured({
        campaignId,
        mode: 'set',
        featuredStart,
        featuredEnd,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      const id = data?.campaign?.id;
      if (typeof id === 'number') {
        resetCampaign(id, queryClient);
      }
    },
  });
}
