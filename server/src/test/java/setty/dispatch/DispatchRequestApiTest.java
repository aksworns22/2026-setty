package setty.dispatch;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import setty.common.operator.OperatorAuthInterceptor;

@SpringBootTest(properties = "setty.operator.secret=" + DispatchRequestApiTest.OPERATOR_SECRET)
@AutoConfigureMockMvc
@Transactional
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
    void createsDispatchRequestAndIssuesSellerInputLink() throws Exception {
        final String body = createDispatchRequest();

        assertThat(buyerToken(body)).isNotBlank();
        assertThat(sellerToken(body)).isNotBlank();
    }

    @Test
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
    void buyerSeesOwnInputAndSellerCompletionFlagOnly() throws Exception {
        final String buyerToken = buyerToken(createDispatchRequest());

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SELLER_INPUT_PENDING"))
                .andExpect(jsonPath("$.buyerName").value(BUYER_NAME))
                .andExpect(jsonPath("$.sellerInputCompleted").value(false));
    }

    @Test
    void sellerSubmissionMovesRequestToFinalReviewPending() throws Exception {
        final String created = createDispatchRequest();
        submitSellerInput(sellerToken(created));

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINAL_REVIEW_PENDING"))
                .andExpect(jsonPath("$.sellerInputCompleted").value(true));
    }

    @Test
    void buyerResponseNeverExposesSellerPersonalInformation() throws Exception {
        final String created = createDispatchRequest();
        submitSellerInput(sellerToken(created));

        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", buyerToken(created)))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString(SELLER_NAME))))
                .andExpect(content().string(not(containsString(SELLER_PHONE_NUMBER))));
    }

    @Test
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
    void rejectsSecondSubmissionOnTheSameSellerToken() throws Exception {
        final String sellerToken = sellerToken(createDispatchRequest());
        submitSellerInput(sellerToken);

        mockMvc.perform(post("/api/dispatch-requests/seller-sessions/{token}", sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(SELLER_PAYLOAD))
                .andExpect(status().isConflict());
    }

    @Test
    void returnsNotFoundForUnknownSellerToken() throws Exception {
        mockMvc.perform(get("/api/dispatch-requests/seller-sessions/{token}", "존재하지-않는-토큰"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsNotFoundForUnknownBuyerToken() throws Exception {
        mockMvc.perform(get("/api/dispatch-requests/{buyerToken}", "존재하지-않는-토큰"))
                .andExpect(status().isNotFound());
    }

    @Test
    void operatorEndpointsRejectRequestsWithoutSecret() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void operatorEndpointsRejectWrongSecret() throws Exception {
        mockMvc.perform(get("/api/operator/dispatch-requests")
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, "wrong-secret"))
                .andExpect(status().isUnauthorized());
    }

    @Test
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
    void operatorDetailHasNoSellerInformationBeforeSellerSubmission() throws Exception {
        createDispatchRequest();

        mockMvc.perform(get("/api/operator/dispatch-requests/{id}", latestDispatchRequestId())
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.buyer.name").value(BUYER_NAME))
                .andExpect(content().string(not(containsString(SELLER_NAME))));
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
        final String body = mockMvc.perform(get("/api/operator/dispatch-requests")
                        .header(OperatorAuthInterceptor.OPERATOR_SECRET_HEADER, OPERATOR_SECRET))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
        final List<Integer> ids = JsonPath.read(body, "$[*].id");

        return ids.stream().max(Integer::compareTo).orElseThrow();
    }

    private String buyerToken(final String createResponseBody) {
        return JsonPath.read(createResponseBody, "$.buyerToken");
    }

    private String sellerToken(final String createResponseBody) {
        final String url = JsonPath.read(createResponseBody, "$.sellerInputUrl");

        return url.substring(url.lastIndexOf('/') + 1);
    }
}
