import type React from 'react';

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
    <a
      href={contractUrl}
      title={address}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer hover:underline"
      onClick={(e) => {
        e.stopPropagation(); // Prevent modal from closing
        console.log('ContractLink clicked:', contractUrl); // Debug log
      }}
      onMouseDown={(e) => {
        e.stopPropagation(); // Prevent any parent handlers
      }}
      style={{ pointerEvents: 'auto' }}
    >
      {children}
    </a>
  );
}

export default ContractLink;
