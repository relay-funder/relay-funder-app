import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BRIDGE_QUERY_KEY = 'bridge';
interface IBridgeKYCStatusRequestApi {
  customerId: string;
}
interface IBridgeKYCStatusResponseApi {
  status: string;
}
interface IBridgeKYCInitiateRequestApi {
  customerId: string;
}
interface IBridgeKYCInitiateResponseApi {
  redirectUrl: string;
}
interface IBridgeCustomerRequestApi {
  userAddress: string;
}
interface IBridgeCustomerResponseApi {
  customerId: string;
  hasCustomer: boolean;
  isKycCompleted: boolean;
}
interface IBridgeUpdateCustomerHook {
  address: string | null | undefined;
}
interface IBridgeUpdateCustomerRequestMutationApi {
  first_name: string;
  last_name: string;
  email: string;
  document_type: string;
  document_number: string;
  dob: string;
  street_number: string;
  street_name: string;
  neighborhood?: string;
  city: string;
  state: string;
  address_country_id: number;
  postal_code: string;
  phone_country_code: string;
  phone_area_code: string;
  phone_number: string;
}
interface IBridgeUpdateCustomerRequestApi
  extends IBridgeUpdateCustomerRequestMutationApi {
  userAddress: string;
  customer_wallet: string;
}
interface IBridgeUpdateCustomerResponseApi {
  redirectUrl: string;
}

async function fetchKYCStatus(
  variables: IBridgeKYCStatusRequestApi,
): Promise<IBridgeKYCStatusResponseApi> {
  const response = await fetch(
    `/api/bridge/kyc/status?customerId=${variables.customerId}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch kyc status');
  }
  const data = await response.json();
  return data;
}
async function fetchCustomer(
  variables: IBridgeCustomerRequestApi,
): Promise<IBridgeCustomerResponseApi> {
  const response = await fetch(
    `/api/bridge/customer?userAddress=${variables.userAddress}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch customer');
  }
  const data = await response.json();
  return data;
}
async function initiateKYC(
  variables: IBridgeKYCInitiateRequestApi,
): Promise<IBridgeKYCInitiateResponseApi> {
  const response = await fetch(`/api/bridge/kyc/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId: variables.customerId,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate kyc');
  }
  const data = await response.json();
  return data;
}
async function updateCustomer(
  variables: IBridgeUpdateCustomerRequestApi,
): Promise<IBridgeUpdateCustomerResponseApi> {
  const response = await fetch(`/api/bridge/customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate kyc');
  }
  const data = await response.json();
  return data;
}
export function useBridgeKYCStatus(variables: IBridgeKYCStatusRequestApi) {
  return useQuery({
    queryKey: [BRIDGE_QUERY_KEY, 'kyc-status'],
    queryFn: async () => fetchKYCStatus(variables),
    refetchInterval: 30_000,
  });
}
export function useBridgeCustomer({ address }: { address?: string | null }) {
  return useQuery({
    queryKey: [BRIDGE_QUERY_KEY, 'customer'],
    queryFn: async () => {
      if (!address) {
        throw new Error('Failed to fetch Customer, address missing');
      }
      return fetchCustomer({ userAddress: address });
    },
    enabled: !!address,
  });
}

export function useBridgeKYCInitiate(variables: IBridgeKYCInitiateRequestApi) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => initiateKYC(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'kyc-status'],
      });
    },
  });
}
export function useBridgeUpdateCustomer({
  address,
}: IBridgeUpdateCustomerHook) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: IBridgeUpdateCustomerRequestMutationApi) =>
      updateCustomer({
        ...variables,
        userAddress: address ?? '',
        customer_wallet: address ?? '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'customer'],
      });
    },
  });
}
