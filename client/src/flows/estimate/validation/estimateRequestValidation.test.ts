import { expect, test } from '@jest/globals';
import {
  EstimateRequestFormValues,
  validateEstimateRequest,
} from './estimateRequestValidation';

const VALID_VALUES: EstimateRequestFormValues = {
  name: '홍 길동',
  phoneNumber: '010-0000-0000',
  tradeArea: '테스트구 테스트동',
  itemType: '테스트 의자',
  highValueItem: 'false',
  privacyConsent: true,
};

test('이름의 앞뒤 공백은 제거하고 내부 공백은 허용한다', () => {
  expect(
    validateEstimateRequest({ ...VALID_VALUES, name: '  홍 길동  ' }).name,
  ).toBeUndefined();
});

test('공백만 있는 이름은 거절한다', () => {
  expect(validateEstimateRequest({ ...VALID_VALUES, name: '   ' }).name).toBe(
    '이름을 입력해 주세요.',
  );
});

test('필수 개인정보 동의가 없으면 견적 요청을 검증 통과시키지 않는다', () => {
  expect(
    validateEstimateRequest({ ...VALID_VALUES, privacyConsent: false }).privacyConsent,
  ).toBe('개인정보 수집·이용에 동의해 주세요.');
});
