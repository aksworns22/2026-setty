import { useState } from 'react';
import styles from './App.module.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className={styles.smokeCheck}>
      <h1 className={styles.title}>Setty</h1>
      <button
        className={styles.action}
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        클릭 {count}회
      </button>
    </main>
  );
}
