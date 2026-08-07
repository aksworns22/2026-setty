import { useState } from 'react';
import BrandHeader from '../components/BrandHeader';
import MobileScreen from '../components/MobileScreen';
import PrimaryButton from '../components/PrimaryButton';
import ResultMessage from '../components/ResultMessage';
import { ErrorMessage } from '../components/StatusMessage';
import TextButton from '../components/TextButton';
import styles from './LinkCreatedScreen.module.css';

interface LinkCreatedScreenProps {
  /** POST /api/dispatch-requests 응답의 sellerInputUrl */
  sellerInputUrl: string;
  /** 공유·복사를 마치고 다음 화면(판매자 대기)으로 이동 */
  onNext: () => void;
}

/** 공유 시트를 사용자가 닫은 경우로, 실패로 안내하지 않는다. */
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

function canUseShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** jsdom과 비보안 컨텍스트에는 clipboard가 없다. */
function canUseClipboard(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function'
  );
}

/**
 * 배차 요청 생성 직후 판매자 입력 링크를 전달하는 화면이다.
 * 서버를 호출하지 않고 브라우저 공유·복사만 사용한다.
 */
export default function LinkCreatedScreen({ sellerInputUrl, onNext }: LinkCreatedScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shareSupported = canUseShare();
  const clipboardSupported = canUseClipboard();
  // 두 API 모두 못 쓰거나 실패했을 때만 링크를 그대로 보여준다.
  const showRawLink = (!shareSupported && !clipboardSupported) || error !== null;

  async function copyLink(): Promise<void> {
    if (!clipboardSupported) {
      setError('이 브라우저에서는 링크를 자동으로 복사할 수 없어요. 아래 링크를 직접 복사해 주세요.');
      return;
    }

    try {
      await navigator.clipboard.writeText(sellerInputUrl);
    } catch {
      setError('링크를 복사하지 못했어요. 아래 링크를 직접 복사해 주세요.');
      return;
    }

    setNotice('링크를 복사했어요');
    onNext();
  }

  async function handleShare(): Promise<void> {
    setNotice(null);
    setError(null);

    if (!shareSupported) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ url: sellerInputUrl });
    } catch (shareError) {
      if (isAbortError(shareError)) {
        return;
      }
      setError('링크를 공유하지 못했어요. 아래 링크를 직접 복사해 주세요.');
      return;
    }

    onNext();
  }

  async function handleCopy(): Promise<void> {
    setNotice(null);
    setError(null);
    await copyLink();
  }

  return (
    <MobileScreen
      header={<BrandHeader />}
      footer={
        <>
          <PrimaryButton onClick={() => void handleShare()}>링크 공유하기</PrimaryButton>
          <TextButton onClick={() => void handleCopy()}>링크 복사</TextButton>
        </>
      }
    >
      <ResultMessage
        emoji="🤝"
        title="거래가 시작됐어요"
        description={'링크를 판매자에게 전달하면\n판매자가 발송 정보를 입력해요.'}
      >
        {showRawLink ? (
          <p className={styles.link} data-testid="seller-input-url">
            {sellerInputUrl}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}
        {error ? (
          <div className={styles.error}>
            <ErrorMessage message={error} />
          </div>
        ) : null}
      </ResultMessage>
    </MobileScreen>
  );
}
