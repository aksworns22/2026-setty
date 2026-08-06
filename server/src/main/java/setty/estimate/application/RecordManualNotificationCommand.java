package setty.estimate.application;

public record RecordManualNotificationCommand(
        String messageContent,
        boolean transportFeasible,
        Long estimatedAmount
) {
}
