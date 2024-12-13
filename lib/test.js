// function createCampaign(bytes32 platformBytes) internal {

//         bytes32 identifierHash = keccak256(abi.encodePacked(platformBytes));
//     bytes32[] memory selectedPlatformBytes = new bytes32[](1);
//     bytes32[] memory platformDataKey;
//     bytes32[] memory platformDataValue;
//     selectedPlatformBytes[0] = platformBytes;

//     vm.startPrank(users.creator1Address);
//     vm.recordLogs();


//     campaignInfoFactory.createCampaign(
//         users.creator1Address,
//         identifierHash,
//         selectedPlatformBytes,
//         platformDataKey,
//         platformDataValue,
//         CAMPAIGN_DATA
//     );

//     Vm.Log[] memory entries = vm.getRecordedLogs();

//     campaignAddress = address(uint160(uint(entries[2].topics[2])));
//     vm.stopPrank();
// }
