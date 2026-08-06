package setty.dispatch.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import setty.dispatch.DispatchProperties;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.domain.SellerInputSession;
import setty.dispatch.dto.buyer.BuyerDispatchRequestCreateRequest;
import setty.dispatch.dto.buyer.BuyerDispatchRequestCreateResponse;
import setty.dispatch.dto.buyer.BuyerDispatchRequestResponse;
import setty.dispatch.exception.DispatchRequestNotFoundException;
import setty.dispatch.repository.DispatchRequestRepository;
import setty.dispatch.repository.SellerInputSessionRepository;

@Service
public class BuyerDispatchRequestService {
    private final DispatchRequestRepository dispatchRequestRepository;
    private final SellerInputSessionRepository sellerInputSessionRepository;
    private final DispatchProperties dispatchProperties;

    public BuyerDispatchRequestService(
            final DispatchRequestRepository dispatchRequestRepository,
            final SellerInputSessionRepository sellerInputSessionRepository,
            final DispatchProperties dispatchProperties
    ) {
        this.dispatchRequestRepository = dispatchRequestRepository;
        this.sellerInputSessionRepository = sellerInputSessionRepository;
        this.dispatchProperties = dispatchProperties;
    }

    @Transactional
    public BuyerDispatchRequestCreateResponse create(final BuyerDispatchRequestCreateRequest request) {
        final DispatchRequest dispatchRequest = dispatchRequestRepository.save(new DispatchRequest(
                UUID.randomUUID().toString(),
                request.buyerName(),
                request.buyerPhoneNumber(),
                request.deliveryAddress(),
                request.itemType(),
                request.highValueItem(),
                request.estimateRequestId()
        ));
        final SellerInputSession session = sellerInputSessionRepository.save(
                new SellerInputSession(UUID.randomUUID().toString(), dispatchRequest)
        );

        return new BuyerDispatchRequestCreateResponse(
                dispatchRequest.getBuyerToken(),
                dispatchProperties.sellerInputBaseUrl() + "/" + session.getToken()
        );
    }

    @Transactional(readOnly = true)
    public BuyerDispatchRequestResponse findByBuyerToken(final String buyerToken) {
        final DispatchRequest dispatchRequest = dispatchRequestRepository.findByBuyerToken(buyerToken)
                .orElseThrow(DispatchRequestNotFoundException::new);

        return BuyerDispatchRequestResponse.from(dispatchRequest);
    }
}
