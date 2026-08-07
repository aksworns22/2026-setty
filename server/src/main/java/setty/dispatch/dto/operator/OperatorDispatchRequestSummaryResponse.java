package setty.dispatch.dto.operator;

import java.time.LocalDateTime;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.domain.DispatchStatus;

public record OperatorDispatchRequestSummaryResponse(
        Long id,
        DispatchStatus status,
        String itemType,
        boolean highValueItem,
        boolean sellerInputCompleted,
        LocalDateTime createdAt
) {
    public static OperatorDispatchRequestSummaryResponse from(final DispatchRequest dispatchRequest) {
        return new OperatorDispatchRequestSummaryResponse(
                dispatchRequest.getId(),
                dispatchRequest.getStatus(),
                dispatchRequest.getItemType(),
                dispatchRequest.isHighValueItem(),
                dispatchRequest.isSellerInputCompleted(),
                dispatchRequest.getCreatedAt()
        );
    }
}
