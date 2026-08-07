import { render, screen } from '@testing-library/react';
import App from '@/app/App';

test('앱 진입점이 배차 흐름 첫 화면을 보여준다', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /거래를 시작하세요/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '거래 링크 만들기' })).toBeInTheDocument();
});
