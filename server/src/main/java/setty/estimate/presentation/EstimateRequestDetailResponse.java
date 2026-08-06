package setty.estimate.presentation;

import java.time.OffsetDateTime;
import setty.estimate.application.EstimateRequestDetail;
import setty.estimate.application.ManualNotificationResult;
import setty.estimate.domain.EstimateRequestStatus;

public record EstimateRequestDetailResponse(
        Long estimateRequestId,
        String name,
        String phoneNumber,
        String tradeArea,
        String itemType,
        boolean highValueItem,
        EstimateRequestStatus status,
        OffsetDateTime createdAt,
        ManualNotificationResponse manualNotification
) {
    public static EstimateRequestDetailResponse from(final EstimateRequestDetail estimateRequestDetail) {
        return new EstimateRequestDetailResponse(
                estimateRequestDetail.estimateRequestId(),
                estimateRequestDetail.name(),
                formatPhoneNumber(estimateRequestDetail.phoneNumber()),
                estimateRequestDetail.tradeArea(),
                estimateRequestDetail.itemType(),
                estimateRequestDetail.highValueItem(),
                estimateRequestDetail.status(),
                estimateRequestDetail.createdAt(),
                ManualNotificationResponse.from(estimateRequestDetail.manualNotification())
        );
    }

    private static String formatPhoneNumber(final String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() != 11) {
            return phoneNumber;
        }

        return phoneNumber.substring(0, 3)
                + "-"
                + phoneNumber.substring(3, 7)
                + "-"
                + phoneNumber.substring(7);
    }

    public record ManualNotificationResponse(
            String messageContent,
            boolean transportFeasible,
            Long estimatedAmount,
            OffsetDateTime notifiedAt
    ) {
        private static ManualNotificationResponse from(final ManualNotificationResult manualNotificationResult) {
            if (manualNotificationResult == null) {
                return null;
            }

            return new ManualNotificationResponse(
                    manualNotificationResult.messageContent(),
                    manualNotificationResult.transportFeasible(),
                    manualNotificationResult.estimatedAmount(),
                    manualNotificationResult.notifiedAt()
            );
        }
    }
}
