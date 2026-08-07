/*
 * 이 화면은 의도적으로 미완이다.
 * server 계약에 구매자 동의·거절 엔드포인트와 최종 금액 필드가 없어
 * (`BuyerDispatchRequestController`는 생성·조회 두 개뿐이고
 *  `BuyerDispatchRequestResponse`에 금액 필드가 없다)
 * "진행하기"·"거래 취소" action을 어떤 요청에도 연결하지 않고 비활성으로 둔다.
 * 계약이 없는 상태에서 임의의 응답 구조나 요청을 만들지 않는다.
 */
import { useCallback, useEffect, useState } from 'react';
import { findBuyerDispatchRequest } from '../api/dispatchApi';
import { DispatchApiError } from '../api/dispatchClient';
import BrandHeader from '../components/BrandHeader';
import MobileScreen from '../components/MobileScreen';
import PrimaryButton from '../components/PrimaryButton';
import ResultMessage from '../components/ResultMessage';
import { ErrorMessage, LoadingMessage } from '../components/StatusMessage';
import TextButton from '../components/TextButton';
import { toDispatchStatusLabel } from '../model/dispatchStatusLabel';
import type { BuyerDispatchRequestResponse } from '../model/dispatchTypes';
import styles from './FinalAmountConfirmScreen.module.css';

interface FinalAmountConfirmScreenProps {
  /** POST /api/dispatch-requests 응답의 buyerToken */
  buyerToken: string;
  onGoHome: () => void;
}

const DEFAULT_ERROR_MESSAGE = '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';

/**
 * 시안 카피("9,900원면 배달돼요")는 자동 가격 계산과 결제를 전제한다.
 * 자동 가격 계산은 `mvp-scope.md` 4장에서 제외됐고 최종 금액은 운영자가
 * 외부 채널에서 조회해 문자로 직접 안내하므로 제품 문서 문구로 대체한다.
 * 구체 금액은 화면에 하드코딩하지 않는다.
 */
const CONFIRM_MESSAGE = {
  emoji: '🚚',
  title: '최종 금액 확인이 필요해요',
  description: '운영자가 확인한 최종 금액과 조건을\n문자(SMS)로 안내해 드릴게요.',
};

const ACTION_NOTE = '동의·거절은 운영자가 보내는 문자로 안내드려요.';
const ACTION_NOTE_ID = 'final-amount-action-note';

/**
 * 운영자가 최종 금액을 안내하는 동안 구매자가 보는 화면이다.
 * server에서 가져오는 값은 현재 상태뿐이며, 금액과 판매자 정보는 표시하지 않는다.
 */
export default function FinalAmountConfirmScreen({
  buyerToken,
  onGoHome,
}: FinalAmountConfirmScreenProps) {
  const [request, setRequest] = useState<BuyerDispatchRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  /** "다시 시도"로 조회를 다시 실행하기 위한 값이다. */
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // StrictMode 이중 마운트와 언마운트 후 setState를 막는다.
    let active = true;

    findBuyerDispatchRequest(buyerToken)
      .then((response) => {
        if (!active) {
          return;
        }
        setRequest(response);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setRequest(null);
        setErrorMessage(error instanceof DispatchApiError ? error.message : DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [buyerToken, retryCount]);

  /** 조회 상태 초기화는 effect 본문이 아니라 재시도 event에서 한다. */
  const handleRetry = useCallback(() => {
    setLoading(true);
    setErrorMessage('');
    setRetryCount((count) => count + 1);
  }, []);

  const loaded = !loading && !errorMessage && request !== null;

  return (
    <MobileScreen
      header={<BrandHeader />}
      footer={
        <>
          {loaded ? (
            <>
              {/* 시안의 두 action이지만 연결할 server 엔드포인트가 없어 비활성이다. */}
              <PrimaryButton disabled aria-describedby={ACTION_NOTE_ID}>
                진행하기
              </PrimaryButton>
              <TextButton disabled aria-describedby={ACTION_NOTE_ID}>
                거래 취소
              </TextButton>
              <p className={styles.actionNote} id={ACTION_NOTE_ID}>
                {ACTION_NOTE}
              </p>
            </>
          ) : null}
          {/* 화면이 막다른 길이 되지 않도록 항상 나가는 길을 둔다. */}
          <TextButton onClick={onGoHome}>홈으로 돌아가기</TextButton>
        </>
      }
    >
      {loading ? <LoadingMessage /> : null}

      {!loading && errorMessage ? (
        <div className={styles.errorArea}>
          <ErrorMessage message={errorMessage} />
          <TextButton onClick={handleRetry}>다시 시도</TextButton>
        </div>
      ) : null}

      {loaded && request ? (
        <ResultMessage
          emoji={CONFIRM_MESSAGE.emoji}
          title={CONFIRM_MESSAGE.title}
          description={CONFIRM_MESSAGE.description}
        >
          {/* 내부 enum 대신 사용자 표시 문구만 노출한다. */}
          <p className={styles.status}>{toDispatchStatusLabel(request.status)}</p>
        </ResultMessage>
      ) : null}
    </MobileScreen>
  );
}
