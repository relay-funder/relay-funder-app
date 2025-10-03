export function PaymentEmpty() {
  return (
    <div className="py-12 text-center">
      <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
        No Transactions Yet
      </h3>
      <p className="text-sm text-muted-foreground">
        Transactions will appear here once donations are confirmed.
      </p>
    </div>
  );
}
