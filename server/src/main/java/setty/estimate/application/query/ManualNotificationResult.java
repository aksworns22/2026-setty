package setty.estimate.application.query;

import java.time.OffsetDateTime;

public record ManualNotificationResult(
        String messageContent,
        boolean transportFeasible,
        Long estimatedAmount,
        OffsetDateTime notifiedAt
) {
}
