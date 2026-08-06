package setty.dispatch.dto.buyer;

import java.time.LocalDateTime;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.domain.DispatchStatus;

public record BuyerDispatchRequestResponse(
        DispatchStatus status,
        String buyerName,
        String buyerPhoneNumber,
        String deliveryAddress,
        String itemType,
        boolean highValueItem,
        boolean sellerInputCompleted,
        LocalDateTime createdAt
) {
    public static BuyerDispatchRequestResponse from(final DispatchRequest dispatchRequest) {
        return new BuyerDispatchRequestResponse(
                dispatchRequest.getStatus(),
                dispatchRequest.getBuyerName(),
                dispatchRequest.getBuyerPhoneNumber(),
                dispatchRequest.getDeliveryAddress(),
                dispatchRequest.getItemType(),
                dispatchRequest.isHighValueItem(),
                dispatchRequest.isSellerInputCompleted(),
                dispatchRequest.getCreatedAt()
        );
    }
}
