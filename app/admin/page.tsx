import { AdminDashboard } from '@/components/admin/dashboard';
import { auth } from '@/server/auth';

import { AdminAccessDenied } from '@/components/admin/access-denied';

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');

  /* TODO: Implement rounds functionality
   * - Add state management for rounds
   * - Add state for selected rounds
   * - Add state for dropdown visibility
   */
  // const [rounds, setRounds] = useState<{ id: number; title: string }[]>([]);
  // const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  // const [dropdownStates, setDropdownStates] = useState<{ [key: number]: boolean }>({});

  /* TODO: Implement campaign round association functionality
   * - Add API endpoint for campaign-round association
   * - Implement error handling and validation
   * - Add success/error notifications
   * - Handle state updates after successful association
   */
  // const addCampaignToRounds = async (campaignId: number) => {
  //   try {
  //     const response = await fetch(`/api/campaigns/round`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         campaignId,
  //         roundIds: selectedRounds,
  //       }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to add campaign to rounds");
  //     }
  //     toast({
  //       title: "Success",
  //       description: "Campaign added to selected rounds successfully.",
  //     });
  //     setSelectedRounds([]); // Clear selection after successful submission
  //     toggleDropdown(campaignId); // Close dropdown
  //   } catch (err) {
  //     console.error("Error adding campaign to rounds:", err);
  //     setError(err instanceof Error ? err.message : "An error occurred");
  //   }
  // };

  /* TODO: Implement dropdown toggle functionality
   * - Add state management for dropdown visibility
   * - Implement toggle logic for each campaign
   * - Add keyboard accessibility
   * - Consider adding animation for smooth transitions
   */
  // const toggleDropdown = (campaignId: number) => {
  //   setDropdownStates((prev) => ({
  //     ...prev,
  //     [campaignId]: !prev[campaignId],
  //   }));
  // };

  // Show access denied if not admin
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  // Main content
  return (
    <div className="mx-auto max-w-7xl p-5">
      <div className="mb-8 pt-5 text-3xl font-bold">Admin Dashboard</div>
      <AdminDashboard />
    </div>
  );
}
