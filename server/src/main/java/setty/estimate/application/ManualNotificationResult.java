package setty.estimate.application;

import java.time.OffsetDateTime;

public record ManualNotificationResult(
        String messageContent,
        boolean transportFeasible,
        Long estimatedAmount,
        OffsetDateTime notifiedAt
) {
}
