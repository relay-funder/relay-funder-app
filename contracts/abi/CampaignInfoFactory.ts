export const CampaignInfoFactoryABI = [
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
    name: '_initialize',
    inputs: [
      {
        name: 'treasuryFactoryAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'globalParams',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createCampaign',
    inputs: [
      {
        name: 'creator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'identifierHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'selectedPlatformBytes',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      {
        name: 'platformDataKey',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      {
        name: 'platformDataValue',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      {
        name: 'campaignData',
        type: 'tuple',
        internalType: 'struct ICampaignData.CampaignData',
        components: [
          {
            name: 'launchTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'goalAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'identifierToCampaignInfo',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isValidCampaignInfo',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateImplementation',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'CampaignInfoFactoryCampaignCreated',
    inputs: [
      {
        name: 'identifierHash',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'campaignInfoAddress',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CampaignInfoFactoryCampaignInitialized',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'CampaignInfoFactoryAlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CampaignInfoFactoryCampaignCreationFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CampaignInfoFactoryCampaignWithSameIdentifierExists',
    inputs: [
      {
        name: 'identifierHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'cloneExists',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'CampaignInfoFactoryInvalidInput',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CampaignInfoFactoryPlatformNotListed',
    inputs: [
      {
        name: 'platformHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
];
