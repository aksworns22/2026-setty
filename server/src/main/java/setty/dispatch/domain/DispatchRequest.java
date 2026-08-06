package setty.dispatch.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import setty.dispatch.exception.DispatchStatusTransitionException;

@Entity
public class DispatchRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String buyerToken;

    @Column(nullable = false)
    private String buyerName;

    @Column(nullable = false)
    private String buyerPhoneNumber;

    @Column(nullable = false)
    private String deliveryAddress;

    @Column(nullable = false)
    private String itemType;

    @Column(nullable = false)
    private boolean highValueItem;

    private Long estimateRequestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DispatchStatus status;

    @Embedded
    private SellerInput sellerInput;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected DispatchRequest() {
    }

    public DispatchRequest(
            final String buyerToken,
            final String buyerName,
            final String buyerPhoneNumber,
            final String deliveryAddress,
            final String itemType,
            final boolean highValueItem,
            final Long estimateRequestId
    ) {
        this.buyerToken = buyerToken;
        this.buyerName = buyerName;
        this.buyerPhoneNumber = buyerPhoneNumber;
        this.deliveryAddress = deliveryAddress;
        this.itemType = itemType;
        this.highValueItem = highValueItem;
        this.estimateRequestId = estimateRequestId;
        this.status = DispatchStatus.SELLER_INPUT_PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public void completeSellerInput(final SellerInput input) {
        if (status != DispatchStatus.SELLER_INPUT_PENDING) {
            throw new DispatchStatusTransitionException(status, DispatchStatus.FINAL_REVIEW_PENDING);
        }
        this.sellerInput = input;
        this.status = DispatchStatus.FINAL_REVIEW_PENDING;
    }

    public boolean isSellerInputCompleted() {
        return status != DispatchStatus.SELLER_INPUT_PENDING;
    }

    public Long getId() {
        return id;
    }

    public String getBuyerToken() {
        return buyerToken;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public String getBuyerPhoneNumber() {
        return buyerPhoneNumber;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getItemType() {
        return itemType;
    }

    public boolean isHighValueItem() {
        return highValueItem;
    }

    public Long getEstimateRequestId() {
        return estimateRequestId;
    }

    public DispatchStatus getStatus() {
        return status;
    }

    public SellerInput getSellerInput() {
        return sellerInput;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
