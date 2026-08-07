import { Link } from 'react-router-dom';
import styles from './EstimatePages.module.css';

export default function EstimateSubmittedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.resultCard} aria-labelledby="submitted-title">
        <div className={styles.resultIcon} aria-hidden="true">
          ✓
        </div>
        <p className={styles.brand}>SETTY</p>
        <h1 id="submitted-title">요청이 접수됐어요</h1>
        <p>
          운영자가 운송 가능 여부와 예상 금액을 직접 확인한 후 문자로 안내할 예정이에요.
        </p>
        <p className={styles.operationNote}>
          자동으로 계산되는 견적이 아니며, 운영시간 밖 요청은 다음 운영 시작 후
          확인합니다.
        </p>
        <Link className={styles.secondaryLink} to="/estimate">
          다른 견적 요청하기
        </Link>
      </section>
    </main>
  );
}
