export const KickStarterQFABI = [
    {
        "type": "constructor",
        "inputs": [
            { "name": "_allo", "type": "address", "internalType": "address" },
            { "name": "_strategyName", "type": "string", "internalType": "string" },
            { "name": "_directTransfer", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "nonpayable"
    },
    { "type": "receive", "stateMutability": "payable" },
    {
        "type": "function",
        "name": "DIRECT_TRANSFER",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "REVIEW_EACH_STATUS",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allocate",
        "inputs": [
            {
                "name": "_recipients",
                "type": "address[]",
                "internalType": "address[]"
            },
            {
                "name": "_amounts",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            { "name": "_data", "type": "bytes", "internalType": "bytes" },
            { "name": "_sender", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "allocationEndTime",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allocationStartTime",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allowedTokens",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "amountAllocated",
        "inputs": [
            { "name": "", "type": "address", "internalType": "address" },
            { "name": "", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "claimAllocation",
        "inputs": [{ "name": "_data", "type": "bytes", "internalType": "bytes" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "distribute",
        "inputs": [
            {
                "name": "_recipientIds",
                "type": "address[]",
                "internalType": "address[]"
            },
            { "name": "_data", "type": "bytes", "internalType": "bytes" },
            { "name": "_sender", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getAllo",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "contract IAllo" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPoolAmount",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPoolId",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getRecipient",
        "inputs": [
            { "name": "_recipientId", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            {
                "name": "_recipient",
                "type": "tuple",
                "internalType": "struct IRecipientsExtension.Recipient",
                "components": [
                    {
                        "name": "useRegistryAnchor",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "recipientAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "statusIndex",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "metadata",
                        "type": "tuple",
                        "internalType": "struct Metadata",
                        "components": [
                            {
                                "name": "protocol",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "pointer",
                                "type": "string",
                                "internalType": "string"
                            }
                        ]
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getStrategyId",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "increasePoolAmount",
        "inputs": [
            { "name": "_amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            { "name": "__poolId", "type": "uint256", "internalType": "uint256" },
            { "name": "_data", "type": "bytes", "internalType": "bytes" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isUsingAllocationMetadata",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "metadataRequired",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "payoutSummaries",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [
            {
                "name": "recipientAddress",
                "type": "address",
                "internalType": "address"
            },
            { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "recipientIndexToRecipientId",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "recipientsCounter",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "register",
        "inputs": [
            {
                "name": "_recipients",
                "type": "address[]",
                "internalType": "address[]"
            },
            { "name": "_data", "type": "bytes", "internalType": "bytes" },
            { "name": "_sender", "type": "address", "internalType": "address" }
        ],
        "outputs": [
            {
                "name": "_recipientIds",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "registrationEndTime",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "registrationStartTime",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "reviewRecipients",
        "inputs": [
            {
                "name": "_statuses",
                "type": "tuple[]",
                "internalType": "struct IRecipientsExtension.ApplicationStatus[]",
                "components": [
                    { "name": "index", "type": "uint256", "internalType": "uint256" },
                    {
                        "name": "statusRow",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "_refRecipientsCounter",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setPayout",
        "inputs": [{ "name": "_data", "type": "bytes", "internalType": "bytes" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "statusesBitMap",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalPayoutAmount",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "updateAllocationTimestamps",
        "inputs": [
            {
                "name": "_allocationStartTime",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "_allocationEndTime",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updatePoolTimestamps",
        "inputs": [
            {
                "name": "_registrationStartTime",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "_registrationEndTime",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [
            { "name": "_token", "type": "address", "internalType": "address" },
            { "name": "_amount", "type": "uint256", "internalType": "uint256" },
            { "name": "_recipient", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawalCooldown",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint64", "internalType": "uint64" }],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "Allocated",
        "inputs": [
            {
                "name": "_recipient",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "AllocationTimestampsUpdated",
        "inputs": [
            {
                "name": "allocationStartTime",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "allocationEndTime",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Claimed",
        "inputs": [
            {
                "name": "recipientId",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Distributed",
        "inputs": [
            {
                "name": "_recipient",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initialized",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PayoutSet",
        "inputs": [
            {
                "name": "recipientId",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RecipientStatusUpdated",
        "inputs": [
            {
                "name": "rowIndex",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "fullRow",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Registered",
        "inputs": [
            {
                "name": "_recipient",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RegistrationTimestampsUpdated",
        "inputs": [
            {
                "name": "registrationStartTime",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "registrationEndTime",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "UpdatedRegistration",
        "inputs": [
            {
                "name": "recipientId",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "status",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdrew",
        "inputs": [
            {
                "name": "_token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "_amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "_recipient",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    { "type": "error", "name": "ALLOCATION_ACTIVE", "inputs": [] },
    { "type": "error", "name": "ALLOCATION_NOT_ACTIVE", "inputs": [] },
    { "type": "error", "name": "ALLOCATION_NOT_ENDED", "inputs": [] },
    { "type": "error", "name": "ALREADY_INITIALIZED", "inputs": [] },
    { "type": "error", "name": "ANCHOR_ERROR", "inputs": [] },
    { "type": "error", "name": "ARRAY_MISMATCH", "inputs": [] },
    {
        "type": "error",
        "name": "AllocationExtension_ALLOCATION_HAS_ALREADY_STARTED",
        "inputs": []
    },
    {
        "type": "error",
        "name": "AllocationExtension_ALLOCATION_HAS_ENDED",
        "inputs": []
    },
    {
        "type": "error",
        "name": "AllocationExtension_ALLOCATION_HAS_NOT_ENDED",
        "inputs": []
    },
    {
        "type": "error",
        "name": "AllocationExtension_ALLOCATION_NOT_ACTIVE",
        "inputs": []
    },
    {
        "type": "error",
        "name": "AllocationExtension_INVALID_ALLOCATION_TIMESTAMPS",
        "inputs": []
    },
    {
        "type": "error",
        "name": "BaseStrategy_AlreadyInitialized",
        "inputs": []
    },
    { "type": "error", "name": "BaseStrategy_InvalidPoolId", "inputs": [] },
    { "type": "error", "name": "BaseStrategy_Unauthorized", "inputs": [] },
    {
        "type": "error",
        "name": "BaseStrategy_WithdrawMoreThanPoolAmount",
        "inputs": []
    },
    { "type": "error", "name": "ETH_MISMATCH", "inputs": [] },
    { "type": "error", "name": "INVALID", "inputs": [] },
    { "type": "error", "name": "INVALID_ADDRESS", "inputs": [] },
    { "type": "error", "name": "INVALID_FEE", "inputs": [] },
    { "type": "error", "name": "INVALID_METADATA", "inputs": [] },
    { "type": "error", "name": "INVALID_REGISTRATION", "inputs": [] },
    { "type": "error", "name": "INVALID_SIGNATURE_LENGTH", "inputs": [] },
    {
        "type": "error",
        "name": "KickstarterQF_NothingToDistribute",
        "inputs": [
            { "name": "recipientId", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "KickstarterQF_PayoutAlreadySet",
        "inputs": [
            { "name": "recipientId", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "KickstarterQF_PayoutsExceedPoolAmount",
        "inputs": []
    },
    { "type": "error", "name": "KickstarterQF_TokenNotAllowed", "inputs": [] },
    { "type": "error", "name": "MISMATCH", "inputs": [] },
    { "type": "error", "name": "NONCE_NOT_AVAILABLE", "inputs": [] },
    { "type": "error", "name": "NON_ZERO_VALUE", "inputs": [] },
    { "type": "error", "name": "NOT_ENOUGH_FUNDS", "inputs": [] },
    { "type": "error", "name": "NOT_IMPLEMENTED", "inputs": [] },
    { "type": "error", "name": "NOT_INITIALIZED", "inputs": [] },
    { "type": "error", "name": "NOT_PENDING_OWNER", "inputs": [] },
    { "type": "error", "name": "POOL_ACTIVE", "inputs": [] },
    { "type": "error", "name": "POOL_INACTIVE", "inputs": [] },
    { "type": "error", "name": "RECIPIENT_ALREADY_ACCEPTED", "inputs": [] },
    {
        "type": "error",
        "name": "RECIPIENT_ERROR",
        "inputs": [
            { "name": "recipientId", "type": "address", "internalType": "address" }
        ]
    },
    { "type": "error", "name": "RECIPIENT_NOT_ACCEPTED", "inputs": [] },
    { "type": "error", "name": "REGISTRATION_ACTIVE", "inputs": [] },
    { "type": "error", "name": "REGISTRATION_NOT_ACTIVE", "inputs": [] },
    {
        "type": "error",
        "name": "RecipientsExtension_InvalidMetada",
        "inputs": []
    },
    {
        "type": "error",
        "name": "RecipientsExtension_RecipientError",
        "inputs": [
            { "name": "recipientId", "type": "address", "internalType": "address" }
        ]
    },
    {
        "type": "error",
        "name": "RecipientsExtension_RecipientNotAccepted",
        "inputs": []
    },
    {
        "type": "error",
        "name": "RecipientsExtension_RegistrationHasNotEnded",
        "inputs": []
    },
    {
        "type": "error",
        "name": "RecipientsExtension_RegistrationNotActive",
        "inputs": []
    },
    { "type": "error", "name": "UNAUTHORIZED", "inputs": [] },
    { "type": "error", "name": "ZERO_ADDRESS", "inputs": [] }
]