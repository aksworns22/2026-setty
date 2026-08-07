package setty.dispatch.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import setty.dispatch.dto.operator.OperatorDispatchRequestDetailResponse;
import setty.dispatch.dto.operator.OperatorDispatchRequestSummaryResponse;
import setty.dispatch.service.OperatorDispatchService;

@RestController
@RequestMapping("/api/operator/dispatch-requests")
public class OperatorDispatchController {
    private final OperatorDispatchService operatorDispatchService;

    public OperatorDispatchController(final OperatorDispatchService operatorDispatchService) {
        this.operatorDispatchService = operatorDispatchService;
    }

    @GetMapping
    public ResponseEntity<List<OperatorDispatchRequestSummaryResponse>> findAll() {
        return ResponseEntity.ok(operatorDispatchService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatorDispatchRequestDetailResponse> findById(@PathVariable final Long id) {
        return ResponseEntity.ok(operatorDispatchService.findById(id));
    }
}
