import type React from 'react';
import Link from 'next/link';

export function ContractLink({
  address,
  chainConfig,
  children = 'View Contract',
}: {
  address?: string | null;
  chainConfig: { blockExplorerUrl?: string };
  children?: React.ReactNode;
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
      {children}
    </Link>
  );
}

export default ContractLink;
