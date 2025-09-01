import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from '@/components/ui';
import { ZeroFeePolicyContent } from './zero-fee-policy-content';

export function ZeroFeePromise() {
  return (
    <div className="space-y-4 rounded-lg bg-slate-50 p-4">
      <h3 className="font-semibold">100% goes to the project always.</h3>
      <p className="text-muted-foreground">
        Every donation is peer-to-peer, with no fees and no middlemen.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">Learn about our zero-fee policy →</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Akashic&apos;s Zero-Fee Policy</DialogTitle>
          </DialogHeader>
          <ZeroFeePolicyContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}
