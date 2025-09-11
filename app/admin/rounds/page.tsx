import { auth } from '@/server/auth';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { RoundExplore } from '@/components/round/explore';

export default async function RoundsPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }
  return <RoundExplore />;
}
