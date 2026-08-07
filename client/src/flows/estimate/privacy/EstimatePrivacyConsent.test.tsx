import { expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EstimatePrivacyConsent from './EstimatePrivacyConsent';

test('필수 동의 전에 목적·항목·기간·거부 결과와 전체 안내 링크를 보여 준다', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <EstimatePrivacyConsent checked={false} onChange={onChange} />
    </MemoryRouter>,
  );

  expect(screen.getByText('목적')).toBeTruthy();
  expect(screen.getByText('입력 항목')).toBeTruthy();
  expect(screen.getByText('처리 중 생성 정보')).toBeTruthy();
  expect(screen.getByText('보유·이용 기간')).toBeTruthy();
  expect(screen.getByText('동의 거부')).toBeTruthy();
  expect(
    screen
      .getByRole('link', {
        name: '개인정보 처리 안내 전체 보기 (새 창)',
      })
      .getAttribute('href'),
  ).toBe('/estimate/privacy');

  await user.click(
    screen.getByRole('checkbox', {
      name: '위 내용을 확인했으며 개인정보 수집·이용에 동의합니다.',
    }),
  );
  expect(onChange).toHaveBeenCalledWith(true);
});
