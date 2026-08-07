import { Link } from 'react-router-dom';
import { ESTIMATE_PRIVACY_POLICY } from './estimatePrivacyPolicy';
import styles from './EstimatePrivacy.module.css';

interface EstimatePrivacyConsentProps {
  checked: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}

export default function EstimatePrivacyConsent({
  checked,
  disabled = false,
  error,
  onChange,
}: EstimatePrivacyConsentProps) {
  const describedBy = ['estimate-privacy-summary', error && 'privacy-consent-error']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={styles.consent} aria-labelledby="estimate-privacy-title">
      <div className={styles.consentHeading}>
        <h2 id="estimate-privacy-title">개인정보 수집·이용 동의</h2>
        <span>필수</span>
      </div>

      <dl className={styles.summary} id="estimate-privacy-summary">
        <div>
          <dt>목적</dt>
          <dd>{ESTIMATE_PRIVACY_POLICY.purpose}</dd>
        </div>
        <div>
          <dt>입력 항목</dt>
          <dd>{ESTIMATE_PRIVACY_POLICY.items}</dd>
        </div>
        <div>
          <dt>처리 중 생성 정보</dt>
          <dd>{ESTIMATE_PRIVACY_POLICY.generatedItems}</dd>
        </div>
        <div>
          <dt>보유·이용 기간</dt>
          <dd>{ESTIMATE_PRIVACY_POLICY.retentionPeriod}</dd>
        </div>
        <div>
          <dt>동의 거부</dt>
          <dd>동의를 거부할 수 있지만, 예상 견적 요청은 접수할 수 없어요.</dd>
        </div>
      </dl>

      <Link
        className={styles.policyLink}
        rel="noreferrer"
        target="_blank"
        to="/estimate/privacy"
      >
        개인정보 처리 안내 전체 보기 (새 창)
      </Link>

      <label className={styles.consentCheck}>
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          checked={checked}
          disabled={disabled}
          name="privacyConsent"
          required
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>위 내용을 확인했으며 개인정보 수집·이용에 동의합니다.</span>
      </label>

      {error && (
        <small id="privacy-consent-error" role="alert">
          {error}
        </small>
      )}
    </section>
  );
}
