'use client';

import { useParams } from 'next/navigation';
import { useCollection as useCollectionQuery } from '@/lib/hooks/useCollections';
import { useMetaTitle } from '@/hooks/use-meta-title';
import { useAuth } from '@/contexts';
import { CollectionDetailLoading } from '@/components/collection/detail-loading';
import { CollectionDetailNoAuth } from '@/components/collection/detail-noauth';
import { CollectionDetailNotFound } from '@/components/collection/detail-not-found';
import { CollectionDetailActions } from '@/components/collection/detail-actions';
import { CollectionItemList } from '@/components/collection/item-list';
import { FullWidthContainer, ContentArea } from '@/components/layout';

export default function CollectionDetailsPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { authenticated } = useAuth();

  const { data: collection, isPending: loading } = useCollectionQuery(id);

  // Set page title for browser history
  useMetaTitle(
    collection?.name
      ? `${collection.name} | Relay Funder`
      : 'Collection | Relay Funder',
  );

  if (loading) {
    return <CollectionDetailLoading />;
  }

  if (!authenticated) {
    return <CollectionDetailNoAuth />;
  }

  if (!collection) {
    return <CollectionDetailNotFound />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <main className="w-full">
        <FullWidthContainer variant="edge-to-edge" padding="sm">
          <ContentArea
            actions={<CollectionDetailActions collection={collection} />}
            subtitle={collection.description}
            spacing="normal"
          >
            <CollectionItemList collection={collection} />
          </ContentArea>
        </FullWidthContainer>
      </main>
    </div>
  );
}
