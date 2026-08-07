# SETTY frontend decisions

- 상태: Issue #5 공통 초기 세팅에 적용
- 결정일: 2026-08-06
- 범위: 실제 견적·배차 기능을 제외한 `client/**` 공통 기반

## 결정

1. 기존 React·TypeScript·Webpack과 npm을 유지한다.
2. `app`, `flows/estimate`, `flows/dispatch`, `shared`로 소유 경계를 나눈다.
3. 전역 디자인 토큰·기반 스타일과 CSS Modules를 기존 CSS 도구로 지원한다.
4. estimate와 dispatch의 직접 정적 import 및 re-export는 ESLint core 규칙으로 막는다.
5. Issue #12의 직접 URL 요구에 React Router를 도입하고, 새 상태·폼·검증 라이브러리는 도입하지 않는다.
6. 기존 카운터를 제거하고 승인된 직접 URL에서 실제 제품 화면을 제공한다.

## 이유와 트레이드오프

- 완전한 FSD보다 두 FE의 사용자 흐름 소유권과 충돌 방지를 먼저 확인한다. 계층은 단순하지만 기능이 늘면 flow 내부 구조를 다시 정해야 할 수 있다.
- CSS Modules는 전역 클래스 충돌을 줄이면서 현재 Webpack·Jest 도구를 재사용한다. 공통 reset과 토큰은 전역 CSS에 남는다.
- 초기 공통 기반에서는 실제 URL이 없어 Router를 미뤘고, Issue #12의 사용자·운영자 직접 URL과 상세 경로가 확정된 뒤 React Router를 선택했다.
- ESLint 규칙은 새 의존성이 없고 CI에 바로 포함된다. 정적 import와 re-export를 보호하지만 동적 import 전체를 분석하는 의존성 그래프 검사는 아니다.

## Design basis

제공된 디자인 초기 시안에서 반복되거나 명시된 값만 `src/shared/styles/tokens.css`에 옮겼다. 시안의 결제·자동 처리 흐름과 카피는 현재 수동 MVP 범위와 충돌하므로 제품 구현 근거로 사용하지 않는다.

- 색: brand, brand hover, strong/body/muted/subtle text, canvas/surface/muted surface, border
- 글꼴: Pretendard 후보와 시스템 fallback
- 반복 규격: 큰 제목, 본문, 주요 action 글자, 56px control 높이, 15px radius

단일 모바일 여백, focus, error, disabled의 의미와 값은 시안에서 확정할 수 없어 공통 토큰으로 만들지 않았다. Pretendard CDN도 추가하지 않았다.

## Shared change rule

`src/app/**`, `src/shared/**`, `src/index.tsx`, Webpack, ESLint, package 설정과 전역 스타일은 공동 영역이다. 한 FE가 변경하고 다른 FE가 리뷰한다. 한 flow에서만 쓰는 값은 해당 flow에 두고 실제 중복이 확인될 때 shared 이동을 검토한다.

## Revisit when

- 라우팅·인증 요구가 현재 Router 범위를 넘어서면 재검토한다.
- 동일 UI·API 기반 코드가 두 flow에서 실제로 반복될 때 shared 하위 구조를 재검토한다.
- 동적 import 등 ESLint 경계를 우회하는 실제 사례가 생길 때 더 강한 검사를 검토한다.
- 새 기술이 필요하면 `AGENTS.md`의 제안 형식으로 비교하고 제한 기술의 코치 확인 여부를 먼저 정한다.

## Issue #12 — estimate와 operator 흐름

- 결정일: 2026-08-06
- `flows/estimate`는 사용자 견적 제출, `flows/operator`는 운영자 화면을 맡는다.
- `operator/estimate`는 견적 FE, 향후 `operator/dispatch`는 배차 FE가 소유한다.
- `operator/auth`와 `operator/shell`은 두 FE 공동 영역으로 상대 FE 리뷰를 받는다.
- 직접 URL·상세 경로·인증 이동을 위해 `react-router-dom`을 사용한다.
- 세부 API 계약·공개 경계·재검토 조건은 [ESTIMATE_OPERATOR_FLOW.md](ESTIMATE_OPERATOR_FLOW.md)에 기록한다.
