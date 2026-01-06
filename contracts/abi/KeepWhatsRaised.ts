export const KeepWhatsRaisedABI = [
  // Constructor
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },

  // Initialize function (proxy pattern)
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      { name: '_platformHash', type: 'bytes32', internalType: 'bytes32' },
      { name: '_infoAddress', type: 'address', internalType: 'address' },
      { name: '_name', type: 'string', internalType: 'string' },
      { name: '_symbol', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Core pledge functions
  {
    type: 'function',
    name: 'pledgeWithoutAReward',
    inputs: [
      { name: 'pledgeId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'backer', type: 'address', internalType: 'address' },
      { name: 'pledgeAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'tipAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'pledgeForAReward',
    inputs: [
      { name: 'pledgeId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'backer', type: 'address', internalType: 'address' },
      { name: 'tipAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'rewards', type: 'bytes32[]', internalType: 'bytes32[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Read functions
  {
    type: 'function',
    name: 'getRaisedAmount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'getAvailableRaisedAmount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'getDeadline',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'getGoalAmount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'getLaunchTime',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'getWithdrawalApprovalStatus',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },

  // Admin functions
  {
    type: 'function',
    name: 'approveWithdrawal',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'setPaymentGatewayFee',
    inputs: [
      { name: 'pledgeId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'fee', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'setFeeAndPledge',
    inputs: [
      { name: 'pledgeId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'backer', type: 'address', internalType: 'address' },
      { name: 'pledgeAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'tip', type: 'uint256', internalType: 'uint256' },
      { name: 'fee', type: 'uint256', internalType: 'uint256' },
      { name: 'reward', type: 'bytes32[]', internalType: 'bytes32[]' },
      { name: 'isPledgeForAReward', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'configureTreasury',
    inputs: [
      {
        name: 'config',
        type: 'tuple',
        internalType: 'struct KeepWhatsRaised.Config',
        components: [
          {
            name: 'minimumWithdrawalForFeeExemption',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'withdrawalDelay', type: 'uint256', internalType: 'uint256' },
          { name: 'refundDelay', type: 'uint256', internalType: 'uint256' },
          {
            name: 'configLockPeriod',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isColombianCreator',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
      {
        name: 'campaignData',
        type: 'tuple',
        internalType: 'struct ICampaignData.CampaignData',
        components: [
          { name: 'launchTime', type: 'uint256', internalType: 'uint256' },
          { name: 'deadline', type: 'uint256', internalType: 'uint256' },
          { name: 'goalAmount', type: 'uint256', internalType: 'uint256' },
        ],
      },
      {
        name: 'feeKeys',
        type: 'tuple',
        internalType: 'struct KeepWhatsRaised.FeeKeys',
        components: [
          { name: 'flatFeeKey', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'cumulativeFlatFeeKey',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'grossPercentageFeeKeys',
            type: 'bytes32[]',
            internalType: 'bytes32[]',
          },
        ],
      },
      {
        name: 'feeValues',
        type: 'tuple',
        internalType: 'struct KeepWhatsRaised.FeeValues',
        components: [
          { name: 'flatFeeValue', type: 'uint256', internalType: 'uint256' },
          {
            name: 'cumulativeFlatFeeValue',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'grossPercentageFeeValues',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'claimRefund',
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'disburseFees',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'claimTip',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'claimFund',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  {
    type: 'function',
    name: 'cancelTreasury',
    inputs: [{ name: 'message', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ERC721 functions (KeepWhatsRaised extends ERC721)
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },

  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },

  // Events
  {
    type: 'event',
    name: 'Receipt',
    inputs: [
      {
        name: 'backer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'reward',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'pledgeAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      { name: 'tip', type: 'uint256', indexed: false, internalType: 'uint256' },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'rewards',
        type: 'bytes32[]',
        indexed: false,
        internalType: 'bytes32[]',
      },
    ],
    anonymous: false,
  },

  {
    type: 'event',
    name: 'WithdrawalApproved',
    inputs: [],
    anonymous: false,
  },

  {
    type: 'event',
    name: 'WithdrawalWithFeeSuccessful',
    inputs: [
      { name: 'to', type: 'address', indexed: true, internalType: 'address' },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      { name: 'fee', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },

  {
    type: 'event',
    name: 'TipClaimed',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'claimer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },

  {
    type: 'event',
    name: 'FundClaimed',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'claimer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },

  {
    type: 'event',
    name: 'RefundClaimed',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'refundAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'claimer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },

  // Errors
  {
    type: 'error',
    name: 'KeepWhatsRaisedUnAuthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedInvalidInput',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedAlreadyEnabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedWithdrawalOverload',
    inputs: [
      { name: 'availableAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'withdrawalAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'fee', type: 'uint256', internalType: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedAlreadyWithdrawn',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedAlreadyClaimed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedNotClaimable',
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedNotClaimableAdmin',
    inputs: [],
  },
  {
    type: 'error',
    name: 'KeepWhatsRaisedConfigLocked',
    inputs: [],
  },
];
