export interface EstimateRequestFormValues {
  name: string;
  phoneNumber: string;
  tradeArea: string;
  itemType: string;
  highValueItem: '' | 'true' | 'false';
  privacyConsent: boolean;
}

export type EstimateRequestField = keyof EstimateRequestFormValues;
export type EstimateRequestFieldErrors = Partial<Record<EstimateRequestField, string>>;

export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s-]/g, '');
}

export function formatPhoneNumber(phoneNumber: string): string {
  const digits = normalizePhoneNumber(phoneNumber);
  if (!/^010\d{8}$/.test(digits)) {
    return phoneNumber;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function validateEstimateRequest(
  values: EstimateRequestFormValues,
): EstimateRequestFieldErrors {
  const errors: EstimateRequestFieldErrors = {};
  const name = values.name.trim();
  const tradeArea = values.tradeArea.trim();
  const itemType = values.itemType.trim();

  if (!name) {
    errors.name = '이름을 입력해 주세요.';
  } else if (name.length > 10) {
    errors.name = '이름은 10자 이하로 입력해 주세요.';
  }

  if (!/^010\d{8}$/.test(normalizePhoneNumber(values.phoneNumber))) {
    errors.phoneNumber = '010으로 시작하는 휴대전화 번호 11자리를 입력해 주세요.';
  }

  if (!tradeArea) {
    errors.tradeArea = '거래 지역을 입력해 주세요.';
  } else if (tradeArea.length > 100) {
    errors.tradeArea = '거래 지역은 100자 이하로 입력해 주세요.';
  }

  if (!itemType) {
    errors.itemType = '물품 종류를 입력해 주세요.';
  } else if (itemType.length > 100) {
    errors.itemType = '물품 종류는 100자 이하로 입력해 주세요.';
  }

  if (!values.highValueItem) {
    errors.highValueItem = '물품 가격이 50만 원을 초과하는지 선택해 주세요.';
  }

  if (!values.privacyConsent) {
    errors.privacyConsent = '개인정보 수집·이용에 동의해 주세요.';
  }

  return errors;
}
