import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DispatchFlow from '@/flows/dispatch/DispatchFlow';

/**
 * 배차 flow의 화면 전환과 server 계약 연결을 확인한다.
 * 개인정보를 남기지 않도록 명백한 가상 데이터만 쓴다.
 */

const BUYER_TOKEN = 'buyer-token-test';
const SELLER_TOKEN = 'seller-token-test';
const SELLER_INPUT_URL = 'http://localhost:5173/seller-input/seller-token-test';

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

const emptyResponse = (status: number): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new Error('no body');
    },
  }) as Response;

const mockFetch = jest.fn<Promise<Response>, [string, RequestInit | undefined]>();

const setPathname = (pathname: string) => {
  window.history.replaceState({}, '', pathname);
};

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  setPathname('/');
});

const lastRequest = () => {
  const call = mockFetch.mock.calls.at(-1);
  if (!call) {
    throw new Error('fetch가 호출되지 않았습니다.');
  }

  return { url: call[0], init: call[1] };
};

describe('구매자 흐름', () => {
  it('홈에서 폼으로 이동해 server 계약대로 배차 요청을 만든다', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      jsonResponse(201, { buyerToken: BUYER_TOKEN, sellerInputUrl: SELLER_INPUT_URL }),
    );

    render(<DispatchFlow />);

    expect(screen.getByRole('heading', { name: /거래를 시작하세요/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '거래 링크 만들기' }));

    await user.type(screen.getByLabelText('상품명'), '3인용 소파');
    await user.type(screen.getByLabelText('구매자 이름'), '가상구매자');
    await user.type(screen.getByLabelText('연락처'), '01000000000');
    await user.type(screen.getByLabelText('받는 주소'), '가상시 가상구 가상로 1');
    await user.click(screen.getByRole('button', { name: /50만원 이상/ }));
    await user.click(screen.getByRole('button', { name: '링크 생성하기' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const { url, init } = lastRequest();
    expect(url).toBe('/api/dispatch-requests');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      itemType: '3인용 소파',
      buyerName: '가상구매자',
      buyerPhoneNumber: '01000000000',
      deliveryAddress: '가상시 가상구 가상로 1',
      highValueItem: true,
    });

    expect(await screen.findByText('거래가 시작됐어요')).toBeInTheDocument();
  });

  it('server 오류 메시지를 성공으로 바꾸지 않고 그대로 보여준다', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      jsonResponse(400, { message: '입력값이 올바르지 않습니다: buyerPhoneNumber' }),
    );

    render(<DispatchFlow />);
    await user.click(screen.getByRole('button', { name: '거래 링크 만들기' }));

    await user.type(screen.getByLabelText('상품명'), '3인용 소파');
    await user.type(screen.getByLabelText('구매자 이름'), '가상구매자');
    await user.type(screen.getByLabelText('연락처'), '01000000000');
    await user.type(screen.getByLabelText('받는 주소'), '가상시 가상구 가상로 1');
    await user.click(screen.getByRole('button', { name: '링크 생성하기' }));

    expect(
      await screen.findByText('입력값이 올바르지 않습니다: buyerPhoneNumber'),
    ).toBeInTheDocument();
    expect(screen.queryByText('거래가 시작됐어요')).not.toBeInTheDocument();
  });

  it('연락처 형식이 server @Pattern과 다르면 API를 호출하지 않는다', async () => {
    const user = userEvent.setup();

    render(<DispatchFlow />);
    await user.click(screen.getByRole('button', { name: '거래 링크 만들기' }));

    await user.type(screen.getByLabelText('상품명'), '3인용 소파');
    await user.type(screen.getByLabelText('구매자 이름'), '가상구매자');
    await user.type(screen.getByLabelText('연락처'), '123');
    await user.type(screen.getByLabelText('받는 주소'), '가상시 가상구 가상로 1');
    await user.click(screen.getByRole('button', { name: '링크 생성하기' }));

    await waitFor(() => expect(screen.getByLabelText('연락처')).toBeInvalid());
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('판매자 흐름', () => {
  it('판매자 링크로 들어오면 세션을 조회하고 입력을 제출한다', async () => {
    const user = userEvent.setup();
    setPathname(`/seller-input/${SELLER_TOKEN}`);
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, { itemType: '3인용 소파', alreadySubmitted: false }))
      .mockResolvedValueOnce(emptyResponse(204));

    render(<DispatchFlow />);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/dispatch-requests/seller-sessions/${SELLER_TOKEN}`,
        expect.objectContaining({ method: 'GET' }),
      ),
    );
    expect(await screen.findByText('3인용 소파')).toBeInTheDocument();

    await user.type(screen.getByLabelText('판매자 이름'), '가상판매자');
    await user.type(screen.getByLabelText('연락처'), '01000000001');
    await user.type(screen.getByLabelText('발송 주소'), '가상시 가상구 가상로 2');
    await user.type(screen.getByLabelText('회수 희망 시간'), '평일 오후 2시 이후');
    await user.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    const { url, init } = lastRequest();
    expect(url).toBe(`/api/dispatch-requests/seller-sessions/${SELLER_TOKEN}`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      sellerName: '가상판매자',
      sellerPhoneNumber: '01000000001',
      pickupAddress: '가상시 가상구 가상로 2',
      availablePickupTime: '평일 오후 2시 이후',
    });

    expect(await screen.findByText('정보가 제출됐어요')).toBeInTheDocument();
  });

  it('이미 제출된 세션이면 다시 제출할 수 없다', async () => {
    setPathname(`/seller-input/${SELLER_TOKEN}`);
    mockFetch.mockResolvedValue(
      jsonResponse(200, { itemType: '3인용 소파', alreadySubmitted: true }),
    );

    render(<DispatchFlow />);

    expect(await screen.findByText(/이미 제출/)).toBeInTheDocument();
    expect(screen.queryByLabelText('판매자 이름')).not.toBeInTheDocument();
  });

  it('세션 조회 실패를 오류로 보여준다', async () => {
    setPathname(`/seller-input/${SELLER_TOKEN}`);
    mockFetch.mockResolvedValue(jsonResponse(404, { message: '판매자 입력 세션을 찾을 수 없습니다.' }));

    render(<DispatchFlow />);

    expect(await screen.findByText('판매자 입력 세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });
});

describe('최종 금액 확인 화면', () => {
  it('상태만 조회하고 동의·거절 action은 server 계약이 없어 비활성이다', async () => {
    setPathname(`/final-amount/${BUYER_TOKEN}`);
    mockFetch.mockResolvedValue(
      jsonResponse(200, {
        status: 'FINAL_AMOUNT_CONFIRM_PENDING',
        buyerName: '가상구매자',
        buyerPhoneNumber: '01000000000',
        deliveryAddress: '가상시 가상구 가상로 1',
        itemType: '3인용 소파',
        highValueItem: true,
        sellerInputCompleted: true,
        createdAt: '2026-08-06T10:00:00',
      }),
    );

    render(<DispatchFlow />);

    expect(
      await screen.findByRole('heading', { name: '최종 금액 확인이 필요해요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '진행하기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '거래 취소' })).toBeDisabled();

    // 구매자 화면에 판매자 정보를 노출하지 않는다.
    expect(screen.queryByText(/010-/)).not.toBeInTheDocument();
  });
});
