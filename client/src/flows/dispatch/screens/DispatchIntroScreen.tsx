import BrandHeader from '../components/BrandHeader';
import MobileScreen from '../components/MobileScreen';
import PrimaryButton from '../components/PrimaryButton';
import TextButton from '../components/TextButton';
import styles from './DispatchIntroScreen.module.css';

interface DispatchIntroScreenProps {
  /** 구매자가 배차 요청(거래 링크 만들기)을 시작한다. */
  onCreateLink: () => void;
  /** 예상 견적 요청 진입점으로 이동한다. */
  onCheckEstimate: () => void;
}

interface IntroStep {
  /** 배지에 표시하는 순번 */
  number: string;
  label: string;
  title: string;
  description: string;
  /** 배지 스타일. 시안의 STEP 1·2·3이 서로 다르다. */
  badgeClassName?: string;
}

/**
 * 시안 카피 중 결제·에스크로·정산을 뜻하는 표현은 현재 MVP 범위 밖이라
 * 운영자가 배송을 수동 조율한다는 실제 흐름 카피로 대체했다.
 */
const INTRO_STEPS: IntroStep[] = [
  {
    number: '1',
    label: 'STEP 1',
    title: '거래 링크 만들기',
    description: '받는 주소·금액을 담아 링크를 생성해요',
    badgeClassName: styles.badgeCurrent,
  },
  {
    number: '2',
    label: 'STEP 2',
    title: '판매자가 사진·주소 입력',
    description: '물품 상태와 발송 정보를 등록해요',
    badgeClassName: styles.badgeNext,
  },
  {
    number: '3',
    label: 'STEP 3',
    title: '확인 후 배차 진행',
    description: '운영자가 최종 금액을 문자로 안내해요',
    badgeClassName: styles.badgeLast,
  },
];

/** 배차 흐름의 홈·온보딩 화면 */
export default function DispatchIntroScreen({
  onCreateLink,
  onCheckEstimate,
}: DispatchIntroScreenProps) {
  return (
    <MobileScreen
      header={<BrandHeader />}
      footer={
        <>
          <PrimaryButton onClick={onCreateLink}>거래 링크 만들기</PrimaryButton>
          <TextButton onClick={onCheckEstimate}>예상 견적 확인하기</TextButton>
        </>
      }
    >
      <div className={styles.content}>
        <h1 className={styles.title}>
          안전하게
          <br />
          거래를 시작하세요
        </h1>
        <p className={styles.subtitle}>
          판매자와 합의한 거래, SETTY 운영자가 배송을 직접 조율해요.
        </p>

        <ol className={styles.timeline}>
          {INTRO_STEPS.map((step) => (
            <li className={styles.step} key={step.label}>
              <span
                className={[styles.badge, step.badgeClassName].filter(Boolean).join(' ')}
                aria-hidden="true"
              >
                {step.number}
              </span>
              <div className={styles.stepBody}>
                <p className={styles.stepLabel}>{step.label}</p>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </MobileScreen>
  );
}
