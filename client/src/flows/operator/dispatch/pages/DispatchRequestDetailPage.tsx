import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/shared/api/http';
import {
  getOperatorDispatchRequest,
  OperatorDispatchRequestDetail,
} from '@/flows/operator/dispatch/api/operatorDispatchApi';
import {
  formatAmount,
  formatKoreanDateTime,
  formatOptionalText,
  getDispatchStatusLabel,
} from '@/flows/operator/dispatch/presentation';
import styles from './OperatorDispatchPages.module.css';

type DetailState = 'loading' | 'ready' | 'not-found' | 'error';
type CopyState = 'idle' | 'copied' | 'error';

export default function DispatchRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<OperatorDispatchRequestDetail | null>(null);
  const [detailState, setDetailState] = useState<DetailState>('loading');
  const [loadedRequestId, setLoadedRequestId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const moveToLogin = useCallback(() => {
    navigate('/operator/login', {
      replace: true,
      state: { from: `${location.pathname}${location.search}` },
    });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController();

    void getOperatorDispatchRequest(id, controller.signal)
      .then((response) => {
        setCopyState('idle');
        setRequest(response);
        setLoadedRequestId(id);
        setDetailState('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          moveToLogin();
          return;
        }
        setLoadedRequestId(id);
        setDetailState(
          error instanceof ApiError && error.status === 404 ? 'not-found' : 'error',
        );
      });

    return () => controller.abort();
  }, [id, moveToLogin, retryKey]);

  const handleCopySellerInputUrl = async () => {
    if (!request?.sellerInputUrl) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable.');
      }
      await navigator.clipboard.writeText(request.sellerInputUrl);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  };

  if (!id) {
    return (
      <div className={styles.stateCard} role="alert">
        <h1>배차 요청을 찾을 수 없어요</h1>
        <Link to="/operator/dispatch-requests">목록으로 돌아가기</Link>
      </div>
    );
  }

  if (loadedRequestId !== id || detailState === 'loading') {
    return (
      <div className={styles.stateCard} role="status">
        배차 요청을 불러오고 있어요…
      </div>
    );
  }

  if (detailState === 'not-found') {
    return (
      <div className={styles.stateCard} role="alert">
        <h1>배차 요청을 찾을 수 없어요</h1>
        <Link to="/operator/dispatch-requests">목록으로 돌아가기</Link>
      </div>
    );
  }

  if (detailState === 'error' || !request) {
    return (
      <div className={styles.stateCard} role="alert">
        <h1>배차 요청을 불러오지 못했어요</h1>
        <p>서버 연결을 확인한 뒤 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => {
            setDetailState('loading');
            setRetryKey((current) => current + 1);
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="operator-dispatch-detail-title">
      <Link className={styles.backLink} to="/operator/dispatch-requests">
        ← 배차 목록
      </Link>

      <header className={styles.detailHeader}>
        <div>
          <p>배차 요청 #{request.id}</p>
          <h1 id="operator-dispatch-detail-title">배차 요청 상세</h1>
        </div>
        <span className={styles.status} data-status={request.status}>
          {getDispatchStatusLabel(request.status)}
        </span>
      </header>

      <div className={styles.detailGrid}>
        <article className={styles.infoCard}>
          <h2>요청 정보</h2>
          <dl>
            <div>
              <dt>물품 종류</dt>
              <dd>{request.itemType}</dd>
            </div>
            <div>
              <dt>50만 원 초과</dt>
              <dd>{request.highValueItem ? '예' : '아니요'}</dd>
            </div>
            <div>
              <dt>접수 시각</dt>
              <dd>{formatKoreanDateTime(request.createdAt)}</dd>
            </div>
            <div>
              <dt>연결된 예상 견적</dt>
              <dd>
                {request.estimateRequestId === null ? (
                  '없음'
                ) : (
                  <Link to={`/operator/estimate-requests/${request.estimateRequestId}`}>
                    #{request.estimateRequestId}
                  </Link>
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.infoCard}>
          <h2>구매자 정보</h2>
          <dl>
            <div>
              <dt>이름</dt>
              <dd>{request.buyer.name}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{request.buyer.phoneNumber}</dd>
            </div>
            <div className={styles.fullWidthDefinition}>
              <dt>수령 주소</dt>
              <dd>{request.buyer.deliveryAddress}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.infoCard}>
          <h2>판매자 정보</h2>
          {request.seller === null ? (
            <div className={styles.sellerPending}>
              <strong>판매자 입력 대기</strong>
              <p>판매자가 아직 픽업 정보를 제출하지 않았습니다.</p>
            </div>
          ) : (
            <dl>
              <div>
                <dt>이름</dt>
                <dd>{request.seller.name}</dd>
              </div>
              <div>
                <dt>연락처</dt>
                <dd>{request.seller.phoneNumber}</dd>
              </div>
              <div className={styles.fullWidthDefinition}>
                <dt>픽업 주소</dt>
                <dd>{request.seller.pickupAddress}</dd>
              </div>
              <div>
                <dt>픽업 가능 시간</dt>
                <dd>{request.seller.availablePickupTime}</dd>
              </div>
              <div>
                <dt>입력 완료 시각</dt>
                <dd>{formatKoreanDateTime(request.sellerInputCompletedAt)}</dd>
              </div>
            </dl>
          )}

          <div className={styles.sellerLinkSection}>
            <label htmlFor="seller-input-url">판매자 입력 링크</label>
            {request.sellerInputUrl ? (
              <div className={styles.sellerLinkControls}>
                <input
                  id="seller-input-url"
                  readOnly
                  value={request.sellerInputUrl}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button type="button" onClick={handleCopySellerInputUrl}>
                  {copyState === 'copied' ? '복사됨' : '링크 복사'}
                </button>
              </div>
            ) : (
              <p className={styles.missingValue}>발급된 판매자 입력 링크가 없습니다.</p>
            )}
            {copyState === 'copied' && (
              <p className={styles.copySuccess} role="status">
                판매자 입력 링크를 복사했습니다.
              </p>
            )}
            {copyState === 'error' && (
              <p className={styles.copyError} role="alert">
                링크를 복사하지 못했습니다. 링크를 직접 선택해 복사해 주세요.
              </p>
            )}
          </div>
        </article>

        <article className={styles.infoCard}>
          <h2>운영 기록</h2>
          <p className={styles.readOnlyNotice}>
            현재 서버에서 조회되는 기록입니다. 이 화면에서는 내용을 변경하지 않습니다.
          </p>
          <dl>
            <div>
              <dt>최종 금액</dt>
              <dd>{formatAmount(request.finalQuotedAmount)}</dd>
            </div>
            <div>
              <dt>금액 확인 시각</dt>
              <dd>{formatKoreanDateTime(request.amountCheckedAt)}</dd>
            </div>
            <div className={styles.fullWidthDefinition}>
              <dt>운영 메모</dt>
              <dd>{formatOptionalText(request.operatorNote)}</dd>
            </div>
            <div className={styles.fullWidthDefinition}>
              <dt>종료 사유</dt>
              <dd>{formatOptionalText(request.closedReason)}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
