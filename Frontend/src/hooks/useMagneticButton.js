import { useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { useIsMobile } from './useIsMobile';

/**
 * Gives a button a subtle "magnetic" pull toward the cursor.
 * Spring-damped (not linear) so it settles like a physical object.
 * Disabled entirely on touch devices and when reduced motion is requested.
 */
export function useMagneticButton(strength = 0.35) {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  function handleMouseMove(e) {
    if (isMobile || prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { ref, springX, springY, handleMouseMove, handleMouseLeave };
}
