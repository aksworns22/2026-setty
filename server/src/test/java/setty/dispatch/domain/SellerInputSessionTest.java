package setty.dispatch.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import setty.dispatch.exception.SellerInputAlreadySubmittedException;

class SellerInputSessionTest {
    private static SellerInputSession newSession() {
        return new SellerInputSession("session-token", new DispatchRequest(
                "buyer-token",
                "테스트구매자",
                "010-0000-0001",
                "서울특별시 테스트구 테스트로 1",
                "책상",
                false,
                null
        ));
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
    void startsPending() {
        assertThat(newSession().isCompleted()).isFalse();
    }

    @Test
    void completingSessionAlsoMovesDispatchRequestForward() {
        final SellerInputSession session = newSession();

        session.complete(newSellerInput());

        assertThat(session.isCompleted()).isTrue();
        assertThat(session.getDispatchRequest().getStatus()).isEqualTo(DispatchStatus.FINAL_REVIEW_PENDING);
    }

    @Test
    void rejectsReuseOfACompletedSession() {
        final SellerInputSession session = newSession();
        session.complete(newSellerInput());

        assertThatThrownBy(() -> session.complete(newSellerInput()))
                .isInstanceOf(SellerInputAlreadySubmittedException.class);
    }
}
