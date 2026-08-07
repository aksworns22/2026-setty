package setty.dispatch;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import setty.common.operator.OperatorAuthInterceptor;

@SpringBootTest(properties = "setty.operator.secret=" + DispatchRequestApiTest.OPERATOR_SECRET)
@AutoConfigureMockMvc
@Transactional
@DisplayName("배차 요청 API")
class DispatchRequestApiTest {
    static final String OPERATOR_SECRET = "test-operator-secret";

    private static final String BUYER_NAME = "테스트구매자";
    private static final String SELLER_NAME = "테스트판매자";
    private static final String BUYER_PHONE_NUMBER = "010-0000-0001";
    private static final String SELLER_PHONE_NUMBER = "010-0000-0002";

    private static final String BUYER_PAYLOAD = """
            {
              "buyerName": "테스트구매자",
              "buyerPhoneNumber": "010-0000-0001",
              "deliveryAddress": "서울특별시 테스트구 테스트로 1",
              "itemType": "책상",
              "highValueItem": false
            }
            """;

    private static final String SELLER_PAYLOAD = """
            {
              "sellerName": "테스트판매자",
              "sellerPhoneNumber": "010-0000-0002",
              "pickupAddress": "서울특별시 테스트구 테스트로 2",
              "availablePickupTime": "평일 오후"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("구매자가 배차 요청을 제출하면 구매자 조회 토큰과 판매자 입력 링크를 함께 발급한다")
    void createsDispatchRequestAndIssuesSellerInputLink() throws Exception {
        final String body = createDispatchRequest();

        assertThat(buyerToken(body)).isNotBlank();
        assertThat(sellerToken(body)).isNotBlank();
    }

    @Test
    @DisplayName("필수 입력값이 빠지면 배차 요청을 만들지 않는다")
    void rejectsCreateWhenRequiredFieldIsMissing() throws Exception {
        mockMvc.perform(post("/api/dispatch-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "buyerName": "테스트구매자",
                                  "buyerPhoneNumber": "010-0000-0001",
                                  "itemType": "책상",
                                  "highValueItem": false
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("연락처 형식이 올바르지 않으면 배차 요청을 만들지 않는다")
    void rejectsCreateWhenPhoneNumberFormatIsInvalid() throws Exception {
        mockMvc.perform(post("/api/dispatch-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "buyerName": "테스트구매자",
                                  "buyerPhoneNumber": "전화번호아님",
                                  "deliveryAddress": "서울특별시 테스트구 테스트로 1",
                                  "itemType": "책상",
                                  "highValueItem": false
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("구매자는 본인이 입력한 값과 판매자 입력 완료 여부만 확인한다")
    void buyerSeesOwnInputAndSellerCompletionFlagOnly() throws Exception {
        final String buyerToken = buyerToken(createDispatchRequest());

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SELLER_INPUT_PENDING"))
                .andExpect(jsonPath("$.buyerName").value(BUYER_NAME))
                .andExpect(jsonPath("$.sellerInputCompleted").value(false));
    }

    @Test
    @DisplayName("판매자가 정보를 입력하면 배차 요청이 최종 검토 대기로 넘어간다")
    void sellerSubmissionMovesRequestToFinalReviewPending() throws Exception {
        final String created = createDispatchRequest();
        submitSellerInput(sellerToken(created));

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINAL_REVIEW_PENDING"))
                .andExpect(jsonPath("$.sellerInputCompleted").value(true));
    }

    @Test
    @DisplayName("판매자가 입력을 마쳐도 구매자 응답에 판매자 개인정보를 담지 않는다")
    void buyerResponseNeverExposesSellerPersonalInformation() throws Exception {
        final String created = createDispatchRequest();
        submitSellerInput(sellerToken(created));

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken(created)))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(SELLER_NAME))))
                .andExpect(content().string(not(containsString(SELLER_PHONE_NUMBER))));
    }

    @Test
    @DisplayName("판매자 링크 응답에 구매자 개인정보를 담지 않는다")
    void sellerSessionResponseNeverExposesBuyerPersonalInformation() throws Exception {
        final String sellerToken = sellerToken(createDispatchRequest());

        mockMvc.perform(get("/api/dispatch-requests/seller-sessions/{token}", sellerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemType").value("책상"))
                .andExpect(jsonPath("$.alreadySubmitted").value(false))
                .andExpect(content().string(not(containsString(BUYER_NAME))))
                .andExpect(content().string(not(containsString(BUYER_PHONE_NUMBER))));
    }

    @Test
    @DisplayName("이미 사용한 판매자 링크로 다시 제출하면 거절한다")
    void rejectsSecondSubmissionOnTheSameSellerToken() throws Exception {
        final String sellerToken = sellerToken(createDispatchRequest());
        submitSellerInput(sellerToken);

        mockMvc.perform(post("/api/dispatch-requests/seller-sessions/{token}", sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(SELLER_PAYLOAD))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("존재하지 않는 판매자 링크는 찾을 수 없다고 응답한다")
    void returnsNotFoundForUnknownSellerToken() throws Exception {
        mockMvc.perform(get("/api/dispatch-requests/seller-sessions/{token}", "존재하지-않는-토큰"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("존재하지 않는 구매자 토큰은 찾을 수 없다고 응답한다")
    void returnsNotFoundForUnknownBuyerToken() throws Exception {
        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", "존재하지-않는-토큰"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("운영자 API는 비밀 헤더가 없으면 접근을 막는다")
    void operatorEndpointsRejectRequestsWithoutSecret() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("운영자 API는 비밀 헤더가 틀리면 접근을 막는다")
    void operatorEndpointsRejectWrongSecret() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests")
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, "wrong-secret"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("운영자는 판매자 입력이 끝난 요청에서 구매자와 판매자 정보를 함께 확인한다")
    void operatorSeesBothSidesAfterSellerSubmission() throws Exception {
        final String created = createDispatchRequest();
        submitSellerInput(sellerToken(created));

        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", latestDispatchRequestId())
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINAL_REVIEW_PENDING"))
                .andExpect(jsonPath("$.buyer.name").value(BUYER_NAME))
                .andExpect(jsonPath("$.seller.name").value(SELLER_NAME));
    }

    @Test
    @DisplayName("판매자가 입력하기 전에는 운영자 상세에 판매자 정보가 없다")
    void operatorDetailHasNoSellerInformationBeforeSellerSubmission() throws Exception {
        createDispatchRequest();

        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", latestDispatchRequestId())
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.buyer.name").value(BUYER_NAME))
                .andExpect(content().string(not(containsString(SELLER_NAME))));
    }

    @Test
    @DisplayName("운영자 목록은 최신 요청부터 보여준다")
    void operatorListIsSortedByLatestFirst() throws Exception {
        createDispatchRequest();
        createDispatchRequest();
        createDispatchRequest();

        final List<Integer> ids = JsonPath.read(findAllAsOperator(), "$[*].id");

        assertThat(ids).hasSizeGreaterThanOrEqualTo(3)
                .isSortedAccordingTo(Comparator.reverseOrder());
    }

    @Test
    @DisplayName("상태 필터를 주면 해당 상태의 요청만 조회한다")
    void operatorListFiltersByStatus() throws Exception {
        createDispatchRequest();
        final String submitted = createDispatchRequest();
        final Integer submittedId = latestDispatchRequestId();
        submitSellerInput(sellerToken(submitted));

        final String pendingBody = findAllAsOperator("SELLER_INPUT_PENDING");
        final List<String> pendingStatuses = JsonPath.read(pendingBody, "$[*].status");
        final List<Integer> pendingIds = JsonPath.read(pendingBody, "$[*].id");

        assertThat(pendingStatuses).isNotEmpty().containsOnly("SELLER_INPUT_PENDING");
        assertThat(pendingIds).doesNotContain(submittedId);

        final List<Integer> reviewIds = JsonPath.read(findAllAsOperator("FINAL_REVIEW_PENDING"), "$[*].id");

        assertThat(reviewIds).contains(submittedId);
    }

    @Test
    @DisplayName("알 수 없는 상태 필터는 잘못된 요청으로 응답한다")
    void rejectsUnknownStatusFilter() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests")
                        .param("status", "존재하지-않는-상태")
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("판매자가 입력하기 전 상세에는 판매자 입력 링크가 있고 판매자 정보는 비어 있다")
    void operatorDetailExposesSellerInputUrlBeforeSellerSubmission() throws Exception {
        final String created = createDispatchRequest();
        final String sellerInputUrl = JsonPath.read(created, "$.sellerInputUrl");

        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", latestDispatchRequestId())
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sellerInputUrl").value(sellerInputUrl))
                .andExpect(jsonPath("$.seller").value(nullValue()));
    }

    @Test
    @DisplayName("운영자 상세도 비밀 헤더가 없으면 접근을 막는다")
    void operatorDetailRejectsRequestsWithoutSecret() throws Exception {
        createDispatchRequest();

        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", latestDispatchRequestId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("존재하지 않는 배차 요청 상세는 찾을 수 없다고 응답한다")
    void returnsNotFoundForUnknownDispatchRequestId() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", Long.MAX_VALUE)
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isNotFound());
    }

    private String createDispatchRequest() throws Exception {
        return mockMvc.perform(post("/api/dispatch-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BUYER_PAYLOAD))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
    }

    private void submitSellerInput(final String sellerToken) throws Exception {
        mockMvc.perform(post("/api/dispatch-requests/seller-sessions/{token}", sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(SELLER_PAYLOAD))
                .andExpect(status().isNoContent());
    }

    private Integer latestDispatchRequestId() throws Exception {
        final List<Integer> ids = JsonPath.read(findAllAsOperator(), "$[*].id");

        return ids.stream().max(Integer::compareTo).orElseThrow();
    }

    private String findAllAsOperator() throws Exception {
        return findAllAsOperator(null);
    }

    private String findAllAsOperator(final String status) throws Exception {
        final MockHttpServletRequestBuilder request = get("/api/operator/dispatch-requests")
                .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET);
        if (status != null) {
            request.param("status", status);
        }

        return mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
    }

    private String buyerToken(final String createResponseBody) {
        return JsonPath.read(createResponseBody, "$.buyerToken");
    }

    private String sellerToken(final String createResponseBody) {
        final String url = JsonPath.read(createResponseBody, "$.sellerInputUrl");

        return url.substring(url.lastIndexOf('/') + 1);
    }
}
