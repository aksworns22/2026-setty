package setty.estimate.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manual_notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ManualNotification {
    private static final ZoneId SEOUL_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estimate_request_id", nullable = false, unique = true)
    private EstimateRequest estimateRequest;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @Column(nullable = false)
    private boolean transportFeasible;

    private Long estimatedAmount;

    @Column(nullable = false)
    private LocalDateTime notifiedAt;

    private ManualNotification(
            final EstimateRequest estimateRequest,
            final String messageContent,
            final boolean transportFeasible,
            final Long estimatedAmount
    ) {
        this.estimateRequest = estimateRequest;
        this.messageContent = messageContent;
        this.transportFeasible = transportFeasible;
        this.estimatedAmount = estimatedAmount;
        this.notifiedAt = LocalDateTime.now(SEOUL_ZONE_ID);
    }

    public static ManualNotification create(
            final EstimateRequest estimateRequest,
            final String messageContent,
            final boolean transportFeasible,
            final Long estimatedAmount
    ) {
        return new ManualNotification(estimateRequest, messageContent, transportFeasible, estimatedAmount);
    }
}
