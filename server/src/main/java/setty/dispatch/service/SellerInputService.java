package setty.dispatch.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import setty.dispatch.domain.SellerInputSession;
import setty.dispatch.dto.seller.SellerInputSessionResponse;
import setty.dispatch.dto.seller.SellerInputSubmitRequest;
import setty.dispatch.exception.SellerInputSessionNotFoundException;
import setty.dispatch.repository.SellerInputSessionRepository;

@Service
public class SellerInputService {
    private final SellerInputSessionRepository sellerInputSessionRepository;

    public SellerInputService(final SellerInputSessionRepository sellerInputSessionRepository) {
        this.sellerInputSessionRepository = sellerInputSessionRepository;
    }

    @Transactional(readOnly = true)
    public SellerInputSessionResponse findSession(final String token) {
        return SellerInputSessionResponse.from(getSession(token));
    }

    @Transactional
    public void submit(final String token, final SellerInputSubmitRequest request) {
        getSession(token).complete(request.toSellerInput());
    }

    private SellerInputSession getSession(final String token) {
        return sellerInputSessionRepository.findByToken(token)
                .orElseThrow(SellerInputSessionNotFoundException::new);
    }
}
