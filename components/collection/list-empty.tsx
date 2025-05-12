import Image from 'next/image';
import { CollectionCreateDialog } from './create-dialog';

export function CollectionListEmpty({
  title = 'No collections yet',
  description = 'Create your first collection to organize campaigns you&apos;reinterested in.',
  withCreate = true,
}: {
  title?: string;
  description?: string;
  withCreate?: boolean;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-8 text-center">
      <Image
        src="/sparkles.png"
        alt="No collections"
        width={64}
        height={64}
        className="mx-auto mb-4"
      />
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      {withCreate && <CollectionCreateDialog buttonTitle="Create Collection" />}
    </div>
  );
}
