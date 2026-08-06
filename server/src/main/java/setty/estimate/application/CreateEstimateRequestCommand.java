package setty.estimate.application;

public record CreateEstimateRequestCommand(
        String name,
        String phoneNumber,
        String tradeArea,
        String itemType,
        boolean highValueItem
) {
}
