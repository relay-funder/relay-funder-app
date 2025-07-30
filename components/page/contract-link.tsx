import Link from 'next/link';

export function ContractLink({
  address,
  chainConfig,
}: {
  address?: string | null;
  chainConfig: { blockExplorerUrl?: string };
}) {
  const blockExplorerUrl =
    chainConfig.blockExplorerUrl ?? 'https://etherscan.io/address/';
  const contractUrl = `${blockExplorerUrl}/address/${address}`;
  if (!address) {
    return null;
  }
  return (
    <Link
      href={contractUrl}
      title={address}
      target="_blank"
      rel="noopener noreferrer"
    >
      View Contract
    </Link>
  );
}

export default ContractLink;
