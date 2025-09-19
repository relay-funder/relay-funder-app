import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from '@/components/ui';

export function ZeroFeePromise() {
  return (
    <div className="space-y-4 rounded-lg bg-slate-50 p-4">
      <h3 className="font-semibold">5% fee: 1% protocol, 4% platform.</h3>
      <p className="text-muted-foreground">
        Each donation includes a 5% fee: 1% goes to protocol costs, and 4%
        supports the platform.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">Learn about our fee structure →</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Relay Funder&apos;s Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              Relay Funder charges a total fee of <strong>5%</strong> on each
              donation.
            </p>
            <ul className="list-disc pl-5">
              <li>
                <strong>1% Protocol Fee:</strong> Covers blockchain and
                protocol-related costs.
              </li>
              <li>
                <strong>4% Platform Fee:</strong> Supports platform development,
                maintenance, and operations.
              </li>
            </ul>
            <p>
              This ensures the sustainability and security of the platform while
              keeping fees transparent and minimal.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
