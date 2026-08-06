package setty.estimate.application;

import java.time.OffsetDateTime;
import setty.estimate.domain.EstimateRequestStatus;

public record CreatedEstimateRequest(
        Long estimateRequestId,
        EstimateRequestStatus status,
        OffsetDateTime createdAt
) {
}
