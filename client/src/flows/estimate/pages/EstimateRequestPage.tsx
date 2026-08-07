import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/shared/api/http';
import { createEstimateRequest } from '@/flows/estimate/api/estimateRequestApi';
import EstimatePrivacyConsent from '@/flows/estimate/privacy/EstimatePrivacyConsent';
import { ESTIMATE_PRIVACY_POLICY_VERSION } from '@/flows/estimate/privacy/estimatePrivacyPolicy';
import {
  EstimateRequestField,
  EstimateRequestFieldErrors,
  EstimateRequestFormValues,
  normalizePhoneNumber,
  validateEstimateRequest,
} from '@/flows/estimate/validation/estimateRequestValidation';
import styles from './EstimatePages.module.css';

const INITIAL_VALUES: EstimateRequestFormValues = {
  name: '',
  phoneNumber: '',
  tradeArea: '',
  itemType: '',
  highValueItem: '',
  privacyConsent: false,
};

const FIELD_NAMES: EstimateRequestField[] = [
  'name',
  'phoneNumber',
  'tradeArea',
  'itemType',
  'highValueItem',
  'privacyConsent',
];

type EstimateRequestTextField = Exclude<EstimateRequestField, 'privacyConsent'>;

function pickFieldErrors(
  fieldErrors?: Record<string, string>,
): EstimateRequestFieldErrors {
  if (!fieldErrors) {
    return {};
  }

  return FIELD_NAMES.reduce<EstimateRequestFieldErrors>((picked, fieldName) => {
    const message = fieldErrors[fieldName];
    if (message) {
      picked[fieldName] = message;
    }
    return picked;
  }, {});
}

export default function EstimateRequestPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<EstimateRequestFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (field: EstimateRequestTextField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const updatePrivacyConsent = (checked: boolean) => {
    setValues((current) => ({ ...current, privacyConsent: checked }));
    setFieldErrors((current) => ({ ...current, privacyConsent: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateEstimateRequest(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await createEstimateRequest({
        name: values.name.trim(),
        phoneNumber: normalizePhoneNumber(values.phoneNumber),
        tradeArea: values.tradeArea.trim(),
        itemType: values.itemType.trim(),
        highValueItem: values.highValueItem === 'true',
        privacyConsent: true,
        privacyPolicyVersion: ESTIMATE_PRIVACY_POLICY_VERSION,
      });
      navigate('/estimate/submitted', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const serverFieldErrors = pickFieldErrors(error.fieldErrors);
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        } else {
          setFormError('입력값을 다시 확인해 주세요.');
        }
      } else {
        setFormError('요청을 접수하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.formCard} aria-labelledby="estimate-title">
        <header className={styles.header}>
          <p className={styles.brand}>SETTY</p>
          <h1 id="estimate-title">예상 견적을 요청해 주세요</h1>
          <p>
            중고 가구·가전의 거래 지역과 물품을 알려주시면 운영자가 직접 확인한 뒤 문자로
            안내해 드려요.
          </p>
        </header>

        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">이름</label>
            <input
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              id="name"
              maxLength={10}
              name="name"
              placeholder="예: 홍길동"
              required
              value={values.name}
              onChange={(event) => updateValue('name', event.target.value)}
            />
            {fieldErrors.name && (
              <small id="name-error" role="alert">
                {fieldErrors.name}
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone-number">연락처</label>
            <input
              aria-describedby={
                fieldErrors.phoneNumber ? 'phone-number-error' : undefined
              }
              aria-invalid={Boolean(fieldErrors.phoneNumber)}
              autoComplete="tel"
              id="phone-number"
              inputMode="tel"
              name="phoneNumber"
              placeholder="010-0000-0000"
              required
              value={values.phoneNumber}
              onChange={(event) => updateValue('phoneNumber', event.target.value)}
            />
            {fieldErrors.phoneNumber && (
              <small id="phone-number-error" role="alert">
                {fieldErrors.phoneNumber}
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="trade-area">거래 지역</label>
            <input
              aria-describedby={
                fieldErrors.tradeArea
                  ? 'trade-area-hint trade-area-error'
                  : 'trade-area-hint'
              }
              aria-invalid={Boolean(fieldErrors.tradeArea)}
              id="trade-area"
              maxLength={100}
              name="tradeArea"
              placeholder="예: OO구 OO동"
              required
              value={values.tradeArea}
              onChange={(event) => updateValue('tradeArea', event.target.value)}
            />
            <small className={styles.fieldHint} id="trade-area-hint">
              동·구 정도만 입력하고 상세주소는 입력하지 마세요.
            </small>
            {fieldErrors.tradeArea && (
              <small id="trade-area-error" role="alert">
                {fieldErrors.tradeArea}
              </small>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="item-type">물품 종류</label>
            <input
              aria-describedby={fieldErrors.itemType ? 'item-type-error' : undefined}
              aria-invalid={Boolean(fieldErrors.itemType)}
              id="item-type"
              maxLength={100}
              name="itemType"
              placeholder="예: 원목 의자"
              required
              value={values.itemType}
              onChange={(event) => updateValue('itemType', event.target.value)}
            />
            {fieldErrors.itemType && (
              <small id="item-type-error" role="alert">
                {fieldErrors.itemType}
              </small>
            )}
          </div>

          <fieldset
            aria-describedby={
              fieldErrors.highValueItem ? 'high-value-item-error' : undefined
            }
            className={styles.choiceGroup}
            aria-invalid={Boolean(fieldErrors.highValueItem)}
            aria-required="true"
          >
            <legend>물품 가격이 50만 원을 초과하나요?</legend>
            <div className={styles.choices}>
              <label>
                <input
                  checked={values.highValueItem === 'false'}
                  name="highValueItem"
                  required
                  type="radio"
                  value="false"
                  onChange={(event) => updateValue('highValueItem', event.target.value)}
                />
                아니요
              </label>
              <label>
                <input
                  checked={values.highValueItem === 'true'}
                  name="highValueItem"
                  required
                  type="radio"
                  value="true"
                  onChange={(event) => updateValue('highValueItem', event.target.value)}
                />
                예
              </label>
            </div>
            {fieldErrors.highValueItem && (
              <small id="high-value-item-error" role="alert">
                {fieldErrors.highValueItem}
              </small>
            )}
          </fieldset>

          <EstimatePrivacyConsent
            checked={values.privacyConsent}
            disabled={isSubmitting}
            error={fieldErrors.privacyConsent}
            onChange={updatePrivacyConsent}
          />

          {formError && (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          )}

          <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
            {isSubmitting ? '접수하고 있어요…' : '예상 견적 요청하기'}
          </button>
        </form>

        <p className={styles.operationNote}>
          운영시간은 매일 10:00~20:00이며, 운영시간 밖 요청은 다음 운영 시작 후
          확인합니다.
        </p>
      </section>
    </main>
  );
}
