package setty.dispatch.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import setty.dispatch.exception.DispatchStatusTransitionException;

@DisplayName("배차 요청")
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
    @DisplayName("생성되면 판매자 입력 대기 상태로 시작한다")
    void startsInSellerInputPending() {
        final DispatchRequest dispatchRequest = newDispatchRequest();

        assertThat(dispatchRequest.getStatus()).isEqualTo(DispatchStatus.SELLER_INPUT_PENDING);
        assertThat(dispatchRequest.isSellerInputCompleted()).isFalse();
    }

    @Test
    @DisplayName("판매자 입력 완료 여부는 상태가 아니라 실제 입력값으로 판단한다")
    void reportsSellerInputCompletionFromInputNotStatus() {
        final DispatchRequest dispatchRequest = newDispatchRequest();

        assertThat(dispatchRequest.isSellerInputCompleted()).isFalse();
        assertThat(dispatchRequest.getSellerInputCompletedAt()).isNull();

        dispatchRequest.completeSellerInput(newSellerInput());

        assertThat(dispatchRequest.isSellerInputCompleted()).isTrue();
        assertThat(dispatchRequest.getSellerInputCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("판매자 입력이 채워지면 최종 검토 대기로 넘어간다")
    void movesToFinalReviewPendingWhenSellerInputIsCompleted() {
        final DispatchRequest dispatchRequest = newDispatchRequest();

        dispatchRequest.completeSellerInput(newSellerInput());

        assertThat(dispatchRequest.getStatus()).isEqualTo(DispatchStatus.FINAL_REVIEW_PENDING);
        assertThat(dispatchRequest.isSellerInputCompleted()).isTrue();
        assertThat(dispatchRequest.getSellerInput().getSellerName()).isEqualTo("테스트판매자");
    }

    @Test
    @DisplayName("판매자 입력 대기가 아닌 요청에는 판매자 입력을 다시 채울 수 없다")
    void rejectsSellerInputWhenRequestIsNoLongerWaitingForSeller() {
        final DispatchRequest dispatchRequest = newDispatchRequest();
        dispatchRequest.completeSellerInput(newSellerInput());

        assertThatThrownBy(() -> dispatchRequest.completeSellerInput(newSellerInput()))
                .isInstanceOf(DispatchStatusTransitionException.class);
    }

    @Test
    @DisplayName("DEC-022에 합의된 배차 상태 11개를 모두 선언한다")
    void declaresEveryAgreedDispatchStatus() {
        assertThat(DispatchStatus.values()).hasSize(11);
    }
}
