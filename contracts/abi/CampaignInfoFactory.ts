export const CampaignInfoFactoryABI = [
  {
    inputs: [
      { name: "creator", type: "address" },
      { name: "identifierHash", type: "bytes32" },
      { name: "selectedPlatformBytes", type: "bytes32[]" },
      { name: "platformDataKey", type: "bytes32[]" },
      { name: "platformDataValue", type: "bytes32[]" },
      {
        name: "campaignData",
        type: "tuple",
        components: [
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "fundingGoal", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" }
        ]
      }
    ],
    name: "createCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const; 