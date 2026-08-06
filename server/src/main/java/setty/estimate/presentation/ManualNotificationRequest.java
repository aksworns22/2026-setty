package setty.estimate.presentation;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ManualNotificationRequest(
        @NotBlank(message = "문자 내용은 필수입니다.")
        String messageContent,

        @NotNull(message = "운송 가능 여부는 필수입니다.")
        Boolean transportFeasible,

        @PositiveOrZero(message = "예상 금액은 0 이상 정수여야 합니다.")
        Long estimatedAmount
) {
    @AssertTrue(message = "운송 가능 시 예상 금액은 0 이상 정수여야 합니다.")
    public boolean isEstimatedAmountProvidedWhenTransportIsFeasible() {
        return !Boolean.TRUE.equals(transportFeasible) || estimatedAmount != null;
    }
}
