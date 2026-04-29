import { permanentRedirect } from 'next/navigation';

export default async function RoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  permanentRedirect(view === 'current' ? '/rounds/current' : '/rounds/past');
}
