import { Button } from '@/components/ui';
export function CampaignEmpty({
  message = "You haven't created any campaigns yet.",
  onCreate,
}: {
  message?: string;
  onCreate?: () => void;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-500">{message}</p>
      {typeof onCreate === 'function' && (
        <Button className="mt-4" onClick={onCreate}>
          Create Your First Campaign
        </Button>
      )}
    </div>
  );
}
