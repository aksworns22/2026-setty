import { requestOperatorJson } from '@/flows/operator/auth/operatorAuthApi';
import { ApiError } from '@/shared/api/http';

export type EstimateRequestStatus = 'PENDING_REVIEW' | 'ESTIMATE_NOTIFIED';

export interface OperatorEstimateRequestSummary {
  estimateRequestId: number;
  tradeArea: string;
  itemType: string;
  highValueItem: boolean;
  status: EstimateRequestStatus;
  createdAt: string;
}

export interface ManualNotification {
  messageContent: string;
  transportFeasible: boolean;
  estimatedAmount: number | null;
  notifiedAt: string;
}

export interface OperatorEstimateRequestDetail extends OperatorEstimateRequestSummary {
  name: string;
  phoneNumber: string;
  manualNotification: ManualNotification | null;
}

export interface CompleteManualNotificationPayload {
  messageContent: string;
  transportFeasible: boolean;
  estimatedAmount: number | null;
}

export function getOperatorEstimateRequests(
  signal?: AbortSignal,
): Promise<OperatorEstimateRequestSummary[]> {
  return requestOperatorJson<OperatorEstimateRequestSummary[]>(
    '/api/operator/estimate-requests',
    { signal },
  );
}

export function getOperatorEstimateRequest(
  estimateRequestId: string,
  signal?: AbortSignal,
): Promise<OperatorEstimateRequestDetail> {
  return requestOperatorJson<OperatorEstimateRequestDetail>(
    `/api/operator/estimate-requests/${encodeURIComponent(estimateRequestId)}`,
    { signal },
  );
}

function hasKnownNotificationFieldError(
  fieldErrors: Record<string, string> | undefined,
): boolean {
  return ['messageContent', 'transportFeasible', 'estimatedAmount'].some((fieldName) =>
    Boolean(fieldErrors?.[fieldName]),
  );
}

export async function completeManualNotification(
  estimateRequestId: string,
  payload: CompleteManualNotificationPayload,
): Promise<void> {
  try {
    await requestOperatorJson<void>(
      `/api/operator/estimate-requests/${encodeURIComponent(estimateRequestId)}/manual-notification`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 400 &&
      !hasKnownNotificationFieldError(error.fieldErrors)
    ) {
      throw new ApiError(400, { code: error.code, message: error.message });
    }
    throw error;
  }
}
