package setty.estimate.presentation.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import setty.estimate.presentation.validation.ValidManualNotification;

@ValidManualNotification
public record ManualNotificationRequest(
        @NotBlank(message = "문자 내용은 필수입니다.")
        String messageContent,

        @NotNull(message = "운송 가능 여부는 필수입니다.")
        Boolean transportFeasible,

        Long estimatedAmount
) {
}
