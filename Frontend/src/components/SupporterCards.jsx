import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchSupporters } from '../api/client';
import './SupporterCards.css';

const FALLBACK_SUPPORTERS = [
  {
    id: 'sup-1',
    name: 'Amara Johnson',
    role: 'Monthly Supporter, 3 years',
    quote:
      'Seeing exactly which project my donation funded — and meeting the families it reached — changed how I think about giving.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sup-2',
    name: 'David Osei',
    role: 'Corporate Partner',
    quote:
      "Our team volunteers at the Westside Meal Program every month. It's the most tangible impact we've had as a company.",
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sup-3',
    name: 'Maria Chen',
    role: 'First-time Donor',
    quote:
      'The M-Pesa donation took under a minute, and I got an update on the literacy lab within a week.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function SupporterCards() {
  const [supporters, setSupporters] = useState(FALLBACK_SUPPORTERS);

  useEffect(() => {
    let cancelled = false;
    fetchSupporters()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setSupporters(data);
        }
      })
      .catch(() => {
        // Keep fallback supporters if the backend isn't reachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section supporters-section">
      <div className="container">
        <span className="eyebrow section-eyebrow supporters-eyebrow">Voices of Hope</span>
        <h2 className="section-title supporters-title">Our Supporters</h2>

        <motion.div
          className="supporter-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {supporters.map((supporter) => (
            <motion.article className="supporter-card" key={supporter.id || supporter.name} variants={item}>
              <div className="supporter-quote-mark">&ldquo;</div>
              <p className="supporter-quote">{supporter.quote}</p>
              <div className="supporter-meta">
                <img src={supporter.avatar} alt={supporter.name} className="supporter-avatar" loading="lazy" />
                <div>
                  <p className="supporter-name">{supporter.name}</p>
                  <p className="supporter-role">{supporter.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
