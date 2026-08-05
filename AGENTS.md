# SETTY repository guidance

## Project context

- SETTY는 중고 가구·가전의 예상 견적 요청과 실제 배차 요청을 운영자가 수동으로 연결하는 서비스다.
- 가격 조회, 문자, 차량 판단, 운송사 접수와 예외 대응은 첫 MVP에서 운영자가 수행한다.
- 자동 가격 계산, 자동 SMS, 운송사 API, 자동 배차, 회원가입과 내부 결제를 구현하지 않는다.
- 구매자와 판매자의 상세주소·연락처를 서로의 화면에 직접 노출하지 않는다.
- 예상 견적 문자나 홈에서 시작한 배차 요청은 별도 요청이며 실제 거래 정보를 다시 입력한다.

## Sources of truth

- `docs/product/`: 최신 제품 기획·흐름·MVP 범위·용어
- `docs/decisions/`: 결정 상태와 이유
- `docs/team/`: 협업·역할·첫 개발 계획
- GitHub Issue: 실제 작업 범위와 완료 조건

작업 전 `docs/README.md`, 관련 제품 문서, DEC와 Issue를 읽는다. 충돌하면 보고하고 미정 정책을 구현으로 대신 정하지 않는다.

## Work authorization

- 설명·검토·계획 요청은 읽기와 결과 제시만 수행한다.
- 구현·수정 요청은 현재 Issue 범위 안에서 작업하고 관련 검증을 수행한다.
- 외부 메시지, 실제 배포, 구매, 데이터 삭제와 외부 서비스 상태 변경은 명시적 승인 없이 수행하지 않는다.

## Privacy and security

- 실제 이름, 전화번호, 상세주소, 사진을 프롬프트·픽스처·로그·스냅샷에 넣지 않는다.
- 테스트에는 명백한 가상 데이터를 사용한다.
- 비밀정보를 커밋하지 않고 환경 변수 또는 승인된 비밀 저장소를 사용한다.
- 개인정보 보관·삭제 정책이 합의되기 전 임의의 기간을 구현하지 않는다.

## Engineering workflow

- GitHub Issue 하나를 하나의 확인 가능한 결과 단위로 작업한다.
- `main`, `develop`에 직접 푸시하지 않는다.
- 작업 브랜치는 `develop`에서 만든다.
- 모든 PR은 작성자가 아닌 팀원 1명의 리뷰를 받는다.
- Merge commit을 사용한다.
- 관련 없는 리팩터링·의존성·자동화를 함께 추가하지 않는다.
- 정책 변경은 관련 제품 문서와 DEC를 같은 PR에서 갱신한다.

## Verification

- 변경 영역의 테스트와 빌드를 실행한다.
- UI는 정상·대기·오류·빈 상태와 실제 흐름을 수동 확인한다.
- API 계약 변경은 client와 server 영향을 함께 확인한다.
- 실행 명령을 추측하지 않고 실제 설정으로 검증한 명령만 문서화한다.

## Current work split

- 예상 견적 요청: 견적 FE·견적 BE
- 배차 요청: 배차 FE·배차 BE1(구매자 요청·판매자 링크)·배차 BE2(판매자 입력·운영자 조회)
- 실제 범위는 `docs/team/initial-development-plan.md`와 GitHub Issue를 따른다.

## Area-specific guidance

- client 전용 작업은 `client/`에서 시작하고 `client/AGENTS.md`를 함께 적용한다.
- server 전용 작업은 `server/`에서 시작하고 `server/AGENTS.md`를 함께 적용한다.
- 문서·계약·저장소 전체 작업은 레포 루트에서 시작한다.
