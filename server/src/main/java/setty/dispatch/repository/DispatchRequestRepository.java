package setty.dispatch.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import setty.dispatch.domain.DispatchRequest;

public interface DispatchRequestRepository extends JpaRepository<DispatchRequest, Long> {
    Optional<DispatchRequest> findByBuyerToken(String buyerToken);
}
