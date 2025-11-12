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
      <h3 className="font-semibold">Transparent Fee Structure</h3>
      <p className="text-muted-foreground">
        Relay Funder maintains fee transparency with minimal fees: 1% CCP
        protocol fee always applies, platform fees are currently waived, plus
        1% Daimo Pay fee for cross-chain donations.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">Learn about our fee structure →</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Relay Funder&apos;s Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-3">
                Relay Funder is committed to fee transparency and minimal
                platform extraction. Our fees are designed to support the
                underlying infrastructure while maximizing impact for campaigns.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b py-2">
                  <div>
                    <strong className="text-sm">CCP Protocol Fee</strong>
                    <p className="text-xs text-muted-foreground">
                      Blockchain infrastructure costs
                    </p>
                  </div>
                  <span className="text-sm font-medium">1%</span>
                </div>
                <div className="flex items-center justify-between border-b py-2">
                  <div>
                    <strong className="text-sm">Platform Fee</strong>
                    <p className="text-xs text-muted-foreground">
                      Relay Funder operations (currently waived)
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    0% (waived)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <strong className="text-sm">Daimo Pay Fee</strong>
                    <p className="text-xs text-muted-foreground">
                      Cross-chain payment processing (when applicable)
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    1% (if using cross-chain)
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <p className="text-sm">
                <strong>Platform Fee Waiver:</strong> To support campaign
                creators and maximize community impact, platform fees are
                currently waived. This policy may change in the future as we
                work toward sustainable revenue models that benefit both users
                and the platform.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlike traditional donation platforms that extract significant
              fees from every transaction, Relay Funder focuses on building
              economic models that create sustainable value for public goods and
              community initiatives.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
