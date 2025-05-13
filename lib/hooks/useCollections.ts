import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Collection } from '@/types';
import { QueryClient } from '@tanstack/react-query';

const COLLECTIONS_QUERY_KEY = 'collections';
const FEATURED_COLLECTIONS_QUERY_KEY = 'featured_collections';

async function fetchFeaturedCollections() {
  const url = `/api/collections/featured`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch featured collections');
  }
  const data = await response.json();
  return data.collections ?? [];
}

async function fetchCollection(
  collectionId: string,
  address: string | null,
): Promise<Collection> {
  const response = await fetch(
    `/api/collections/${collectionId}?userAddress=${address || ''}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user collection');
  }
  const data = await response.json();
  return data.collection;
}
async function fetchUserCollections(address: string): Promise<Collection[]> {
  const response = await fetch(`/api/collections/?userAddress=${address}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user collections');
  }
  const data = await response.json();
  return data.collections ?? [];
}

export function useFeaturedCollections() {
  return useQuery({
    queryKey: [FEATURED_COLLECTIONS_QUERY_KEY],
    queryFn: () => fetchFeaturedCollections(),
    enabled: true,
  });
}

export function useUserCollections(address?: string | null) {
  return useQuery({
    queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
    queryFn: () => fetchUserCollections(address!),
    enabled: !!address,
  });
}
export function useCollection(collectionId: string, address: string | null) {
  return useQuery({
    queryKey: [COLLECTIONS_QUERY_KEY, address, collectionId],
    queryFn: () => fetchCollection(collectionId!, address),
    enabled: !!collectionId,
  });
}

export function useCreateCollection(address: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const data = await response.json();
      return data?.collection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
      });
    },
  });
}
export function useCreateItemInCollection(address: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      itemId,
      itemType,
    }: {
      collectionId: string;
      itemId: string;
      itemType: string;
    }) => {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection item');
      }
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, address, collectionId],
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
      });
    },
  });
}
export function useDeleteItemFromCollection(address: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      itemId,
    }: {
      collectionId: string;
      itemId: string;
    }) => {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item from collection');
      }
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, address, collectionId],
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
      });
    },
  });
}
export function useDeleteCollection(address: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId }: { collectionId: string }) => {
      const response = await fetch(
        `/api/collections/${collectionId}?userAddress=${address}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete collection');
      }
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, address, collectionId],
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
      });
      queryClient.invalidateQueries({
        queryKey: [FEATURED_COLLECTIONS_QUERY_KEY],
      });
    },
  });
}
// Prefetching function
export async function prefetchFeaturedCollections(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: [FEATURED_COLLECTIONS_QUERY_KEY],
    queryFn: () => fetchFeaturedCollections(),
  });
}
export function useUpdateCollection(address: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      name,
      description,
    }: {
      collectionId: string;
      name: string;
      description: string;
    }) => {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update collection');
      }
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, address, collectionId],
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COLLECTIONS_QUERY_KEY, 'user', address],
      });
    },
  });
}
