import { useState } from 'react';
import '@/App.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Setty</h1>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        클릭 {count}회
      </button>
    </main>
  );
}