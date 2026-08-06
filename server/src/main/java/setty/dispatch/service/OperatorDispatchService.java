package setty.dispatch.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import setty.dispatch.domain.DispatchRequest;
import setty.dispatch.dto.operator.OperatorDispatchRequestDetailResponse;
import setty.dispatch.dto.operator.OperatorDispatchRequestSummaryResponse;
import setty.dispatch.exception.DispatchRequestNotFoundException;
import setty.dispatch.repository.DispatchRequestRepository;

@Service
public class OperatorDispatchService {
    private final DispatchRequestRepository dispatchRequestRepository;

    public OperatorDispatchService(final DispatchRequestRepository dispatchRequestRepository) {
        this.dispatchRequestRepository = dispatchRequestRepository;
    }

    @Transactional(readOnly = true)
    public List<OperatorDispatchRequestSummaryResponse> findAll() {
        return dispatchRequestRepository.findAll().stream()
                .map(OperatorDispatchRequestSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OperatorDispatchRequestDetailResponse findById(final Long id) {
        final DispatchRequest dispatchRequest = dispatchRequestRepository.findById(id)
                .orElseThrow(DispatchRequestNotFoundException::new);

        return OperatorDispatchRequestDetailResponse.from(dispatchRequest);
    }
}
