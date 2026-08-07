package setty.dispatch.dto.operator;

import java.time.LocalDateTime;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.domain.DispatchStatus;
import setty.dispatch.domain.SellerInput;

public record OperatorDispatchRequestDetailResponse(
        Long id,
        DispatchStatus status,
        String itemType,
        boolean highValueItem,
        Long estimateRequestId,
        LocalDateTime createdAt,
        Buyer buyer,
        Seller seller,
        String sellerInputUrl
) {
    public record Buyer(
            String name,
            String phoneNumber,
            String deliveryAddress
    ) {
    }

    public record Seller(
            String name,
            String phoneNumber,
            String pickupAddress,
            String availablePickupTime
    ) {
    }

    public static OperatorDispatchRequestDetailResponse from(
            final DispatchRequest dispatchRequest,
            final String sellerInputUrl
    ) {
        return new OperatorDispatchRequestDetailResponse(
                dispatchRequest.getId(),
                dispatchRequest.getStatus(),
                dispatchRequest.getItemType(),
                dispatchRequest.isHighValueItem(),
                dispatchRequest.getEstimateRequestId(),
                dispatchRequest.getCreatedAt(),
                new Buyer(
                        dispatchRequest.getBuyerName(),
                        dispatchRequest.getBuyerPhoneNumber(),
                        dispatchRequest.getDeliveryAddress()
                ),
                toSeller(dispatchRequest.getSellerInput()),
                sellerInputUrl
        );
    }

    private static Seller toSeller(final SellerInput sellerInput) {
        if (sellerInput == null || sellerInput.getSellerName() == null) {
            return null;
        }
        return new Seller(
                sellerInput.getSellerName(),
                sellerInput.getSellerPhoneNumber(),
                sellerInput.getPickupAddress(),
                sellerInput.getAvailablePickupTime()
        );
    }
}
