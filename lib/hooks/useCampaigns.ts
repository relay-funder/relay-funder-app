import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Campaign } from '@/types/campaign'

const CAMPAIGNS_QUERY_KEY = 'campaigns'

async function fetchCampaigns(status?: string) {
    const url = status ? `/api/campaigns?status=${status}` : '/api/campaigns'
    const response = await fetch(url)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch campaigns')
    }
    const data = await response.json()
    return data.campaigns
}

async function fetchUserCampaigns(address: string) {
    const response = await fetch(`/api/campaigns/user?address=${address}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch user campaigns')
    }
    const data = await response.json()
    return data.campaigns
}

export function useCampaigns(status?: string) {
    return useQuery({
        queryKey: [CAMPAIGNS_QUERY_KEY, status],
        queryFn: () => fetchCampaigns(status),
        enabled: true,
    })
}

export function useUserCampaigns(address?: string) {
    return useQuery({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', address],
        queryFn: () => fetchUserCampaigns(address!),
        enabled: !!address,
    })
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            campaignId,
            status,
            transactionHash,
            campaignAddress
        }: {
            campaignId: string
            status?: string
            transactionHash?: string
            campaignAddress?: string
        }) => {
            const response = await fetch('/api/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    status,
                    transactionHash,
                    campaignAddress,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update campaign')
            }

            return response.json()
        },
        onSuccess: () => {
            // Invalidate and refetch campaigns queries
            queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] })
        },
    })
} 