import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `target` once the element enters the viewport.
 * Uses requestAnimationFrame with an eased curve rather than setInterval
 * for smoother, frame-accurate motion.
 */
export function useCounter(target, { duration = 1800 } = {}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const start = performance.now();
          const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(target);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return [ref, value];
}
