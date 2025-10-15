export const enableApiMock =
  process.env.MOCK_API || process.env.NEXT_PUBLIC_MOCK_AUTH
    ? process.env.MOCK_API === 'true' ||
      process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
    : false;
export const enableFormDefault = true;
export const enableBypassContractAdmin = process.env.NEXT_PUBLIC_MOCK_AUTH
  ? process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
  : false;
