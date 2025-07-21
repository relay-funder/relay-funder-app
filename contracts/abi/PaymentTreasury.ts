export const PaymentTreasuryABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_platformHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_infoAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: '_symbol',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Core payment functions
  {
    type: 'function',
    name: 'createPayment',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'buyerAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'itemId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'expiration',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'confirmPayment',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'confirmPaymentBatch',
    inputs: [
      {
        name: 'paymentIds',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelPayment',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Read functions
  {
    type: 'function',
    name: 'getRaisedAmount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAvailableRaisedAmount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getplatformHash',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getplatformFeePercent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },

  // Admin functions
  {
    type: 'function',
    name: 'withdraw',
    inputs: [],
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
    name: 'claimRefund',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'refundAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelTreasury',
    inputs: [
      {
        name: 'message',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ERC721 functions (if needed)
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
  {
    type: 'event',
    name: 'PaymentCreated',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'buyerAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'itemId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'expiration',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PaymentConfirmed',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PaymentBatchConfirmed',
    inputs: [
      {
        name: 'paymentIds',
        type: 'bytes32[]',
        indexed: false,
        internalType: 'bytes32[]',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PaymentCancelled',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeesDisbursed',
    inputs: [
      {
        name: 'protocolShare',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'platformShare',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawalSuccessful',
    inputs: [
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RefundClaimed',
    inputs: [
      {
        name: 'paymentId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
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
  {
    type: 'error',
    name: 'PaymentTreasuryUnauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PaymentTreasuryInsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PaymentTreasuryInvalidAmount',
    inputs: [],
  },
];
