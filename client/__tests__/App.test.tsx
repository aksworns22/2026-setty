import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/app/App';

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  fetchMock.mockReset();
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: fetchMock,
    writable: true,
  });
});

test('루트 경로는 견적 화면으로 이동하지 않고 후속 공동 홈을 위해 비워 둔다', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { name: '페이지를 찾을 수 없어요' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: '예상 견적을 요청해 주세요' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: '예상 견적 요청으로 이동' }),
  ).not.toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
