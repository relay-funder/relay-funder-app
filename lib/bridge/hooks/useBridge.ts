import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BridgeCustomerGetRequest,
  BridgeCustomerGetResponse,
  BridgeCustomerPostRequest,
  BridgeCustomerPostResponse,
  BridgeKycInitiatePostRequest,
  BridgeKycInitiatePostResponse,
  BridgeKycStatusGetRequest,
  BridgeKycStatusGetResponse,
  BridgePaymentMethodDeleteRequest,
  BridgePaymentMethodDeleteResponse,
  BridgePaymentMethodDetails,
  BridgePaymentMethodsGetRequest,
  BridgePaymentMethodsGetResponse,
  BridgePaymentMethodsPostRequest,
  BridgePaymentMethodsPostResponse,
} from '../api/types';

const BRIDGE_QUERY_KEY = 'bridge';

interface IBridgeUpdateCustomerHook {
  userAddress: string;
}
interface IBridgeUpdateCustomerRequestMutationApi {
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  dob: string;
  streetNumber: string;
  streetName: string;
  neighborhood?: string;
  city: string;
  state: string;
  addressCountryId: number;
  postalCode: string;
  phoneCountryCode: string;
  phoneAreaCode: string;
  phoneNumber: string;
}

interface IBridgeCreatePaymentMethodHook {
  userAddress: string;
}
interface IBridgeCreatePaymentMethodRequestMutationApi {
  type: string;
  provider: string;
  bankDetails: BridgePaymentMethodDetails;
}

interface IBridgeDeletePaymentMethodHook {
  userAddress: string;
}
interface IBridgeDeletePaymentMethodRequestMutationApi {
  paymentMethodId: number;
}

async function fetchKYCStatus(variables: BridgeKycStatusGetRequest) {
  const response = await fetch(
    `/api/bridge/kyc/status?userAddress=${variables.userAddress}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch kyc status');
  }
  const data: BridgeKycStatusGetResponse = await response.json();
  return data;
}
async function fetchPaymentMethods(variables: BridgePaymentMethodsGetRequest) {
  const response = await fetch(
    `/api/bridge/payment-methods?userAddress=${variables.userAddress}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment methods');
  }
  const data: BridgePaymentMethodsGetResponse = await response.json();
  return data.paymentMethods;
}
async function fetchCustomer(variables: BridgeCustomerGetRequest) {
  const response = await fetch(
    `/api/bridge/customer?userAddress=${variables.userAddress}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch customer');
  }
  const data: BridgeCustomerGetResponse = await response.json();
  return data;
}
async function initiateKYC(variables: BridgeKycInitiatePostRequest) {
  const response = await fetch(`/api/bridge/kyc/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAddress: variables.userAddress,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate kyc');
  }
  const data: BridgeKycInitiatePostResponse = await response.json();
  return data;
}
async function updateCustomer(variables: BridgeCustomerPostRequest) {
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
  const data: BridgeCustomerPostResponse = await response.json();
  return data;
}
async function createPaymentMethod(variables: BridgePaymentMethodsPostRequest) {
  const response = await fetch(`/api/bridge/payment-methods`, {
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
  const data: BridgePaymentMethodsPostResponse = await response.json();
  return data;
}
async function deletePaymentMethod(
  variables: BridgePaymentMethodDeleteRequest,
) {
  const response = await fetch(
    `/api/bridge/payment-methods/${variables.paymentMethodId}?userAddress=${variables.userAddress}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate kyc');
  }
  const data: BridgePaymentMethodDeleteResponse = await response.json();
  return data;
}

//
// read hooks
//

export function useBridgeKYCStatus(variables: BridgeKycStatusGetRequest) {
  return useQuery({
    queryKey: [BRIDGE_QUERY_KEY, 'kyc-status'],
    queryFn: async () => fetchKYCStatus(variables),
    refetchInterval: 30_000,
  });
}
export function useBridgePaymentMethods(
  variables: BridgePaymentMethodsGetRequest,
) {
  return useQuery({
    queryKey: [BRIDGE_QUERY_KEY, 'payment-methods'],
    queryFn: async () => {
      if (!variables.userAddress) {
        throw new Error('Failed to fetch Payment-Methods, address missing');
      }
      return fetchPaymentMethods(variables);
    },
    enabled: !!variables.userAddress,
  });
}
export function useBridgeCustomer(variables: BridgeCustomerGetRequest) {
  return useQuery({
    queryKey: [BRIDGE_QUERY_KEY, 'customer'],
    queryFn: async () => {
      if (!variables.userAddress) {
        throw new Error('Failed to fetch Customer, address missing');
      }
      return fetchCustomer(variables);
    },
    enabled: !!variables.userAddress,
  });
}

//
// mutation hooks
//

export function useBridgeKYCInitiate(variables: BridgeKycInitiatePostRequest) {
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
  userAddress,
}: IBridgeUpdateCustomerHook) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: IBridgeUpdateCustomerRequestMutationApi) =>
      updateCustomer({
        ...variables,
        userAddress,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'customer'],
      });
    },
  });
}
export function useBridgeCreatePaymentMethod({
  userAddress,
}: IBridgeCreatePaymentMethodHook) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      variables: IBridgeCreatePaymentMethodRequestMutationApi,
    ) =>
      createPaymentMethod({
        ...variables,
        userAddress: userAddress ?? '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'payment-methods'],
      });
    },
  });
}
export function useBridgeDeletePaymentMethod({
  userAddress,
}: IBridgeDeletePaymentMethodHook) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      variables: IBridgeDeletePaymentMethodRequestMutationApi,
    ) =>
      deletePaymentMethod({
        ...variables,
        userAddress: userAddress ?? '',
      }),
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'payment-methods'],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [BRIDGE_QUERY_KEY, 'payment-methods'],
      });
    },
  });
}
