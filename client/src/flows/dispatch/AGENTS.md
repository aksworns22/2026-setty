# SETTY dispatch flow guidance

루트 `AGENTS.md`와 `client/AGENTS.md`를 함께 적용한다.

## Session start and ownership

- 세션 시작 위치와 관계없이 담당 flow를 `dispatch`, 소유 경로를 `client/src/flows/dispatch/**`로 먼저 밝힌다.
- 현재 배차 Issue와 이 파일까지 읽은 뒤 편집한다.
- `client/src/flows/estimate/**`를 수정하거나 직접 import하지 않는다.
- `app`, `shared`, Webpack, ESLint, package 설정과 전역 스타일 변경이 필요하면 범위를 확대하지 말고 영향과 이유를 먼저 보고하고 견적 FE 리뷰를 받는다.

## Sources

- `docs/product/user-operation-flow.md`
- `docs/product/mvp-scope.md`
- `docs/decisions/DEC-016-request-inputs.md`
- `docs/decisions/DEC-017-information-visibility.md`
- `docs/decisions/DEC-018-operating-hours.md`
- `docs/decisions/DEC-020-privacy-retention.md`
- `docs/decisions/DEC-021-transport-channel.md`
- `docs/decisions/DEC-022-status-model.md`
- `docs/decisions/DEC-023-storage-and-admin.md`
- `client/FRONTEND_DECISIONS.md`
- `client/src/shared/styles/tokens.css`

제공된 디자인 초기 시안의 제품 흐름·카피보다 위 제품·결정 문서를 우선한다. 시안에 없는 디자인 값과 server 계약을 임의로 확정하지 않는다.

## Flow boundary

- 예상 견적에서 진입해도 배차는 새 요청이며 실제 거래 정보를 다시 받는다.
- 구매자와 판매자에게 상대방의 상세주소·연락처를 직접 노출하지 않는다.
- 문자, 차량 판단, 운송사 접수와 실제 배차를 자동화하지 않는다.
- 한 flow에서만 쓰는 코드와 스타일은 이 경로에 두고, 실제 공통 사용이 확인되기 전 `shared`로 옮기지 않는다.
