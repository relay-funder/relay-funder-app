'use client';

import { useCollection } from '@/contexts/CollectionContext';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts';
import { CollectionLoading } from '@/components/collection/loading';
import { CollectionCreateDialog } from '@/components/collection/create-dialog';
import { CollectionList } from '@/components/collection/list';
import { CollectionListEmpty } from '@/components/collection/list-empty';
import { CollectionListEmptyNoAuth } from '@/components/collection/list-empty-noauth';
import { PageLayout } from '@/components/page/layout';
import { PageDefaultContent } from '@/components/page/default-content';

export default function CollectionsPage() {
  const { featuredCollections, userCollections, isLoading } = useCollection();
  const { authenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUserCollections = useMemo(
    () =>
      userCollections.filter((collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [userCollections, searchTerm],
  );

  const filteredFeaturedCollections = useMemo(
    () =>
      featuredCollections.filter((collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [featuredCollections, searchTerm],
  );

  return (
    <PageLayout
      title="Collections"
      searchPlaceholder="Search Collections..."
      onSearchChanged={(search: string) => setSearchTerm(search)}
      buttons={<CollectionCreateDialog />}
    >
      <PageDefaultContent>
        {authenticated ? (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Your Collections</h2>
            {isLoading ? (
              <CollectionLoading />
            ) : userCollections.length > 0 ? (
              <CollectionList collections={filteredUserCollections} />
            ) : (
              <CollectionListEmpty />
            )}
          </section>
        ) : (
          <section className="mb-12">
            <CollectionListEmptyNoAuth />
          </section>
        )}

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Featured Collections</h2>
          {isLoading ? (
            <CollectionLoading />
          ) : filteredFeaturedCollections.length > 0 ? (
            <CollectionList collections={filteredFeaturedCollections} />
          ) : (
            <CollectionListEmpty
              title="No featured collections available"
              description="Check back later for curated collections from our team."
              withCreate={false}
            />
          )}
        </section>
      </PageDefaultContent>
    </PageLayout>
  );
}
