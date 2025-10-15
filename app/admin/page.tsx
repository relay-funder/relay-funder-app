import { AdminDashboard } from '@/components/admin/dashboard';
import { auth } from '@/server/auth';
import { AdminAccessDenied } from '@/components/admin/access-denied';

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  // Show access denied if not admin
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  // Main content - AdminDashboard already includes PageHome layout
  return <AdminDashboard />;
}
