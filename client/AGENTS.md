# SETTY client guidance

루트 `AGENTS.md`와 함께 적용한다.

## Confirmed environment

- React, TypeScript, Webpack
- Node.js 20 이상
- package manager: npm
- 설치: `npm ci`
- 실행: `npm run dev`
- lint: `npm run lint`
- typecheck: `npm run typecheck`
- 테스트: `npm test`
- CI 테스트: `npm run test:ci`
- 빌드: `npm run build`

## Before editing

- `docs/product/user-operation-flow.md`와 현재 Issue를 읽는다.
- server 계약이 없으면 임의 응답 구조를 확정하지 않는다.
- 화면별로 볼 수 있는 정보와 숨길 상대방 정보를 확인한다.

## Product behavior

- 예상 견적과 배차 요청은 별도 진입점과 별도 요청이다.
- 예상 견적 사용자는 문자 안내 후 정상 종료할 수 있다.
- 배차 요청은 실제 거래 정보를 다시 받는다.
- 구매자에게 판매자 상세정보를, 판매자에게 구매자 상세정보를 표시하지 않는다.
- 수동 처리 중인 기능을 자동 처리처럼 표현하지 않는다.

## Work split

- 견적 FE: 예상 견적 사용자 폼과 최소 운영자 확인 화면
- 배차 FE: 구매자 배차 요청, 판매자 입력과 최소 운영자 확인 화면

두 역할은 같은 파일을 동시에 크게 수정하지 않고 공통 UI 변경을 먼저 공유한다.

## Verification

- 정상·로딩·입력 오류·server 실패·빈 상태를 확인한다.
- API 오류를 성공으로 표시하지 않는다.
- 브라우저 로그·목 데이터·스냅샷에 개인정보나 비밀을 남기지 않는다.
- 변경 후 lint, typecheck, 관련 테스트와 build를 실행한다.
