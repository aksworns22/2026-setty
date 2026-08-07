/**
 * 배차 flow의 화면 단계다.
 * `FRONTEND_DECISIONS.md` 5번에 따라 React Router를 쓰지 않고 flow 내부 상태로 전환한다.
 * 역할별 직접 URL 계약이 승인되면 이 타입을 라우팅으로 바꾼다.
 */
export type DispatchStep =
  | 'INTRO'
  | 'BUYER_FORM'
  | 'LINK_CREATED'
  | 'SELLER_WAITING'
  | 'SELLER_FORM'
  | 'SELLER_SUBMITTED'
  | 'FINAL_AMOUNT_CONFIRM';

/**
 * 판매자 전용 링크로 들어온 경우를 구분한다.
 * `DispatchProperties.sellerInputBaseUrl`이 `.../seller-input`이므로
 * `/seller-input/{token}` 경로에서 토큰을 읽는다.
 */
const SELLER_INPUT_PATH = '/seller-input/';

/**
 * 최종 금액 확인은 운영자가 문자로 보낸 링크로 진입한다.
 * 이 경로는 아직 server·팀 승인 계약이 아니라 client 임시 규약이다.
 */
const FINAL_AMOUNT_PATH = '/final-amount/';

const readTokenAfter = (pathname: string, prefix: string): string | null => {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const token = pathname.slice(prefix.length).split('/')[0];

  return token ? decodeURIComponent(token) : null;
};

export const readSellerTokenFromLocation = (pathname: string): string | null =>
  readTokenAfter(pathname, SELLER_INPUT_PATH);

export const readFinalAmountTokenFromLocation = (pathname: string): string | null =>
  readTokenAfter(pathname, FINAL_AMOUNT_PATH);
