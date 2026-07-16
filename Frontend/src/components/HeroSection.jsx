import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useCounter } from '../hooks/useCounter';
import { useMagneticButton } from '../hooks/useMagneticButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { fetchProjects, fetchDonations, fetchSupporters } from '../api/client';
import './HeroSection.css';

// Real project-site photography — swap these for your own asset pipeline.
// Using an unsplash-style rotation keeps the slider working out of the box.
const SLIDER_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Volunteers distributing supplies to families in an Atlanta neighborhood',
  },
  {
    src: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1600&q=80',
    alt: 'Children at a community education project site',
  },
  {
    src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80',
    alt: 'Community members building a shared garden project',
  },
];

const FALLBACK_STATS = [
  { label: 'Lives Impacted', value: 18400, suffix: '+' },
  { label: 'Projects Completed', value: 126, suffix: '' },
  { label: 'Active Supporters', value: 3250, suffix: '+' },
];

function StatCounter({ label, value, suffix }) {
  const [ref, count] = useCounter(value);
  return (
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-value">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

function MagneticButton({ as: Tag = 'button', className, children, ...props }) {
  const { ref, springX, springY, handleMouseMove, handleMouseLeave } = useMagneticButton(0.3);
  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Tag className={className} {...props}>
        {children}
      </Tag>
    </motion.div>
  );
}

export default function HeroSection({ onDonateClick, onExploreClick }) {
  const isMobile = useIsMobile();
  const sectionRef = useRef(null);
  const [particlesReady, setParticlesReady] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });
  const [stats, setStats] = useState(FALLBACK_STATS);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Parallax layers: background drifts slower than midground.
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const midY = useTransform(scrollYProgress, [0, 1], ['0%', '55%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // tsParticles engine init (once).
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  // Background slider rotation.
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDER_IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Live counters — try the backend, fall back to seeded numbers so the
  // hero never looks broken while the API is unavailable.
  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const [projects, donations, supporters] = await Promise.all([
          fetchProjects(),
          fetchDonations(),
          fetchSupporters(),
        ]);
        if (cancelled) return;
        const livesImpacted = Array.isArray(donations)
          ? donations.reduce((sum, d) => sum + (d.beneficiaries || 0), 0) || FALLBACK_STATS[0].value
          : FALLBACK_STATS[0].value;
        setStats([
          { label: 'Lives Impacted', value: livesImpacted, suffix: '+' },
          { label: 'Projects Completed', value: Array.isArray(projects) ? projects.length : FALLBACK_STATS[1].value, suffix: '' },
          { label: 'Active Supporters', value: Array.isArray(supporters) ? supporters.length : FALLBACK_STATS[2].value, suffix: '+' },
        ]);
      } catch {
        // Backend not reachable yet — keep the seeded fallback numbers.
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSpotlightMove = useCallback(
    (e) => {
      if (isMobile) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
    },
    [isMobile]
  );

  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    fpsLimit: 60,
    particles: {
      number: { value: isMobile ? 0 : 60, density: { enable: true, area: 900 } },
      color: { value: ['#F59E0B', '#8B5CF6', '#10B981'] },
      opacity: { value: 0.5 },
      size: { value: { min: 1, max: 2.5 } },
      links: {
        enable: true,
        distance: 130,
        color: '#8B5CF6',
        opacity: 0.25,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6,
        outModes: { default: 'bounce' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: !isMobile, mode: 'grab' },
        resize: true,
      },
      modes: {
        grab: { distance: 160, links: { opacity: 0.5 } },
      },
    },
    detectRetina: true,
  };

  return (
    <section
      className="hero"
      ref={sectionRef}
      onMouseMove={handleSpotlightMove}
      onMouseLeave={() => setSpotlight((s) => ({ ...s, active: false }))}
    >
      {/* Parallax background image slider */}
      <motion.div className="hero-slider" style={{ y: isMobile ? 0 : bgY }}>
        {SLIDER_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`hero-slide ${i === slideIndex ? 'is-active' : ''}`}
          />
        ))}
        <div className="hero-scrim" />
      </motion.div>

      {/* Particle network — desktop only for performance */}
      {particlesReady && !isMobile && (
        <motion.div className="hero-particles" style={{ y: midY }}>
          <Particles id="hope-particles" options={particlesOptions} />
        </motion.div>
      )}

      {/* Cursor spotlight reveal */}
      {!isMobile && (
        <div
          className="hero-spotlight"
          style={{
            opacity: spotlight.active ? 1 : 0,
            background: `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, rgba(245,158,11,0.16), transparent 65%)`,
          }}
        />
      )}

      <motion.div
        className="hero-content container"
        style={{ opacity: isMobile ? 1 : contentOpacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="eyebrow hero-eyebrow">Atlanta Hope Organisation</span>
        <h1 className="hero-headline">
          Together We Empower Communities,
          <br />
          <span className="hero-headline-accent">One Donation at a Time.</span>
        </h1>
        <p className="hero-subhead">
          Every gift funds a real project in a real neighborhood — from meal programs to
          youth education — with full transparency on where it goes and who it reaches.
        </p>

        <div className="hero-ctas">
          <MagneticButton className="btn btn-donate" onClick={onDonateClick}>
            Donate Now
          </MagneticButton>
          <MagneticButton className="btn btn-explore" onClick={onExploreClick}>
            Explore Projects
          </MagneticButton>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </motion.div>

      <div className="hero-slider-dots">
        {SLIDER_IMAGES.map((img, i) => (
          <button
            key={img.src}
            aria-label={`Show slide ${i + 1}`}
            className={`hero-dot ${i === slideIndex ? 'is-active' : ''}`}
            onClick={() => setSlideIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
