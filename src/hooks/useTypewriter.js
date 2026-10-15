import { useEffect, useState } from 'react';

const SPEED_MS = { slow: 45, normal: 22, fast: 8, instant: 0 };

/** Reveals text gradually. Instant when speed is 'instant' or reduced motion is requested. */
export function useTypewriter(text, speed = 'normal', reduced = false) {
  const ms = reduced ? 0 : SPEED_MS[speed] ?? 22;
  const [count, setCount] = useState(ms === 0 ? text.length : 0);
  useEffect(() => {
    if (ms === 0) { setCount(text.length); return undefined; }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [text, ms]);
  return { shown: text.slice(0, count), done: count >= text.length, skip: () => setCount(text.length) };
}
