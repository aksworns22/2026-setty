package setty.dispatch.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.domain.DispatchStatus;
import setty.dispatch.domain.SellerInputSession;
import setty.dispatch.dto.operator.OperatorDispatchRequestDetailResponse;
import setty.dispatch.dto.operator.OperatorDispatchRequestSummaryResponse;
import setty.dispatch.exception.DispatchRequestNotFoundException;
import setty.dispatch.repository.DispatchRequestRepository;
import setty.dispatch.repository.SellerInputSessionRepository;

@Service
public class OperatorDispatchService {
    private final DispatchRequestRepository dispatchRequestRepository;
    private final SellerInputSessionRepository sellerInputSessionRepository;
    private final SellerInputUrlFactory sellerInputUrlFactory;

    public OperatorDispatchService(
            final DispatchRequestRepository dispatchRequestRepository,
            final SellerInputSessionRepository sellerInputSessionRepository,
            final SellerInputUrlFactory sellerInputUrlFactory
    ) {
        this.dispatchRequestRepository = dispatchRequestRepository;
        this.sellerInputSessionRepository = sellerInputSessionRepository;
        this.sellerInputUrlFactory = sellerInputUrlFactory;
    }

    @Transactional(readOnly = true)
    public List<OperatorDispatchRequestSummaryResponse> findAll(final DispatchStatus status) {
        return findSortedByLatest(status).stream()
                .map(OperatorDispatchRequestSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OperatorDispatchRequestDetailResponse findById(final Long id) {
        final DispatchRequest dispatchRequest = dispatchRequestRepository.findById(id)
                .orElseThrow(DispatchRequestNotFoundException::new);
        final String sellerInputUrl = sellerInputSessionRepository.findByDispatchRequestId(id)
                .map(SellerInputSession::getToken)
                .map(sellerInputUrlFactory::create)
                .orElse(null);

        return OperatorDispatchRequestDetailResponse.from(dispatchRequest, sellerInputUrl);
    }

    private List<DispatchRequest> findSortedByLatest(final DispatchStatus status) {
        if (status == null) {
            return dispatchRequestRepository.findAllByOrderByCreatedAtDescIdDesc();
        }
        return dispatchRequestRepository.findAllByStatusOrderByCreatedAtDescIdDesc(status);
    }
}
