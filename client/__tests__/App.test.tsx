import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/app/App';

test('버튼을 누르면 카운트가 올라간다', async () => {
  render(<App />);

  const button = screen.getByRole('button', { name: /클릭/ });
  await userEvent.click(button);

  expect(screen.getByRole('button', { name: /클릭 1회/ })).toBeInTheDocument();
});
