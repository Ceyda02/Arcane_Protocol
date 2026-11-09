import { useEffect, useRef, useState } from 'react';

export default function CursorSparkles() {
  const [sparks, setSparks] = useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timers = new Set();
    let lastSparkAt = 0;

    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse' || document.documentElement.dataset.motion === 'on') return;
      const now = performance.now();
      if (now - lastSparkAt < 65) return;
      lastSparkAt = now;
      const id = nextId.current++;
      setSparks((current) => [...current.slice(-11), { id, x: event.clientX, y: event.clientY, style: id % 3 }]);
      const timer = window.setTimeout(() => {
        setSparks((current) => current.filter((spark) => spark.id !== id));
        timers.delete(timer);
      }, 750);
      timers.add(timer);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div className="cursor-sparkles" aria-hidden="true">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className={`cursor-sparkle cursor-sparkle-${spark.style}`}
          style={{ left: spark.x, top: spark.y }}
        />
      ))}
    </div>
  );
}
