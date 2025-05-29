import Link from 'next/link';
import { Button } from '@/components/ui';
export function CampaignEmpty({
  message = "You haven't created any campaigns yet.",
  buttonText = "Create Your First Campaign",
  buttonHref = "/",
}: {
  message?: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-500">{message}</p>

      <Button className="mt-4" asChild>
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  );
}
