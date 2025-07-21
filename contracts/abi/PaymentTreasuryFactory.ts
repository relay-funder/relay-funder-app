// PaymentTreasury uses the same TreasuryFactory as KeepWhatsRaised
// The difference is in the implementationId parameter (0 = KeepWhatsRaised, 1 = PaymentTreasury)
export const PaymentTreasuryFactoryABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'globalParams',
        type: 'address',
        internalType: 'contract IGlobalParams',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deploy',
    inputs: [
      {
        name: 'platformHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'infoAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'implementationId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        name: 'clone',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerTreasuryImplementation',
    inputs: [
      {
        name: 'platformHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'implementationId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveTreasuryImplementation',
    inputs: [
      {
        name: 'platformHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'implementationId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'computePaymentTreasuryAddress',
    inputs: [
      {
        name: 'identifierHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'platformBytes',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'bytecodeIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'treasuryAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'isDeployed',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addBytecodeChunk',
    inputs: [
      {
        name: 'platformBytes',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'bytecodeIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'chunkIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isLastChunk',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'bytecodeChunk',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'enlistBytecode',
    inputs: [
      {
        name: 'platformBytes',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'bytecodeIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'PaymentTreasuryDeployed',
    inputs: [
      {
        name: 'platformBytes',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'bytecodeIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'campaignInfo',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'treasuryAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'PaymentTreasuryFactoryUnauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PaymentTreasuryFactoryBytecodeNotApproved',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PaymentTreasuryFactoryTreasuryCreationFailed',
    inputs: [],
  },
];
