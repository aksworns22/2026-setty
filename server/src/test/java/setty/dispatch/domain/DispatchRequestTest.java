package setty.dispatch.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import setty.dispatch.exception.DispatchStatusTransitionException;

class DispatchRequestTest {
    private static DispatchRequest newDispatchRequest() {
        return new DispatchRequest(
                "buyer-token",
                "테스트구매자",
                "010-0000-0001",
                "서울특별시 테스트구 테스트로 1",
                "책상",
                false,
                null
        );
    }

    private static SellerInput newSellerInput() {
        return new SellerInput(
                "테스트판매자",
                "010-0000-0002",
                "서울특별시 테스트구 테스트로 2",
                "평일 오후"
        );
    }

    @Test
    void startsInSellerInputPending() {
        final DispatchRequest dispatchRequest = newDispatchRequest();

        assertThat(dispatchRequest.getStatus()).isEqualTo(DispatchStatus.SELLER_INPUT_PENDING);
        assertThat(dispatchRequest.isSellerInputCompleted()).isFalse();
    }

    @Test
    void movesToFinalReviewPendingWhenSellerInputIsCompleted() {
        final DispatchRequest dispatchRequest = newDispatchRequest();

        dispatchRequest.completeSellerInput(newSellerInput());

        assertThat(dispatchRequest.getStatus()).isEqualTo(DispatchStatus.FINAL_REVIEW_PENDING);
        assertThat(dispatchRequest.isSellerInputCompleted()).isTrue();
        assertThat(dispatchRequest.getSellerInput().getSellerName()).isEqualTo("테스트판매자");
    }

    @Test
    void rejectsSellerInputWhenRequestIsNoLongerWaitingForSeller() {
        final DispatchRequest dispatchRequest = newDispatchRequest();
        dispatchRequest.completeSellerInput(newSellerInput());

        assertThatThrownBy(() -> dispatchRequest.completeSellerInput(newSellerInput()))
                .isInstanceOf(DispatchStatusTransitionException.class);
    }

    @Test
    void declaresEveryAgreedDispatchStatus() {
        assertThat(DispatchStatus.values()).hasSize(11);
    }
}
