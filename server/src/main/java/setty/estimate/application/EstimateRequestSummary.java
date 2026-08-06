package setty.estimate.application;

import java.time.OffsetDateTime;
import setty.estimate.domain.EstimateRequestStatus;

public record EstimateRequestSummary(
        Long estimateRequestId,
        String tradeArea,
        String itemType,
        boolean highValueItem,
        EstimateRequestStatus status,
        OffsetDateTime createdAt
) {
}
