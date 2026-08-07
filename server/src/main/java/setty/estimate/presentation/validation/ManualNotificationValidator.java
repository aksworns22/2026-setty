package setty.estimate.presentation.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import setty.estimate.presentation.payload.ManualNotificationRequest;

public class ManualNotificationValidator implements ConstraintValidator<ValidManualNotification, ManualNotificationRequest> {
    @Override
    public boolean isValid(
            final ManualNotificationRequest request,
            final ConstraintValidatorContext context
    ) {
        if (request == null || request.transportFeasible() == null) {
            return true;
        }

        final boolean isValid = request.transportFeasible()
                ? request.estimatedAmount() != null && request.estimatedAmount() >= 0
                : request.estimatedAmount() == null;
        if (isValid) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                .addPropertyNode("estimatedAmount")
                .addConstraintViolation();
        return false;
    }
}
