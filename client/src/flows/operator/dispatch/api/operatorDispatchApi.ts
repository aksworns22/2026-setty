import { requestOperatorJson } from '@/flows/operator/auth/operatorAuthApi';

export const DISPATCH_STATUSES = [
  'SELLER_INPUT_PENDING',
  'FINAL_REVIEW_PENDING',
  'FINAL_AMOUNT_CONFIRM_PENDING',
  'DISPATCH_PENDING',
  'DISPATCH_COMPLETED',
  'IN_TRANSIT',
  'DELIVERY_COMPLETED',
  'FINAL_AMOUNT_REJECTED',
  'TRANSPORT_INFEASIBLE',
  'USER_CANCELLED',
  'DISPATCH_FAILED',
] as const;

export type DispatchStatus = (typeof DISPATCH_STATUSES)[number];

export interface OperatorDispatchRequestSummary {
  id: number;
  status: DispatchStatus;
  itemType: string;
  highValueItem: boolean;
  sellerInputCompleted: boolean;
  finalQuotedAmount: number | null;
  createdAt: string;
}

export interface OperatorDispatchBuyer {
  name: string;
  phoneNumber: string;
  deliveryAddress: string;
}

export interface OperatorDispatchSeller {
  name: string;
  phoneNumber: string;
  pickupAddress: string;
  availablePickupTime: string;
}

export interface OperatorDispatchRequestDetail extends Omit<
  OperatorDispatchRequestSummary,
  'sellerInputCompleted'
> {
  estimateRequestId: number | null;
  buyer: OperatorDispatchBuyer;
  seller: OperatorDispatchSeller | null;
  sellerInputUrl: string | null;
  sellerInputCompletedAt: string | null;
  amountCheckedAt: string | null;
  operatorNote: string | null;
  closedReason: string | null;
}

export function isDispatchStatus(value: string | null): value is DispatchStatus {
  return DISPATCH_STATUSES.some((status) => status === value);
}

export function getOperatorDispatchRequests(
  status?: DispatchStatus,
  signal?: AbortSignal,
): Promise<OperatorDispatchRequestSummary[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return requestOperatorJson<OperatorDispatchRequestSummary[]>(
    `/api/operator/dispatch-requests${query}`,
    { signal },
  );
}

export function getOperatorDispatchRequest(
  dispatchRequestId: string,
  signal?: AbortSignal,
): Promise<OperatorDispatchRequestDetail> {
  return requestOperatorJson<OperatorDispatchRequestDetail>(
    `/api/operator/dispatch-requests/${encodeURIComponent(dispatchRequestId)}`,
    { signal },
  );
}
