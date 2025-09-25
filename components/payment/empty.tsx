export function PaymentEmpty() {
  return (
    <div className="py-12 text-center">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        No Transactions Yet
      </h3>
      <p className="text-sm text-gray-500">
        Transactions will appear here once donations are confirmed.
      </p>
    </div>
  );
}
