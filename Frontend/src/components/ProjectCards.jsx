import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchProjects } from '../api/client';
import './ProjectCards.css';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_PROJECTS = [
  {
    id: 'fallback-1',
    title: 'Westside Meal Program',
    category: 'Food Security',
    description: 'Weekly hot meals and grocery packs for 400+ families across Westside Atlanta.',
    progress: 82,
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fallback-2',
    title: 'Youth Literacy Lab',
    category: 'Education',
    description: 'After-school reading and mentorship for 150 students in under-resourced schools.',
    progress: 64,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fallback-3',
    title: 'Community Health Clinic',
    category: 'Healthcare',
    description: 'Free screenings and primary care access for uninsured residents.',
    progress: 47,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
  },
];

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (index % 3) * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  return (
    <motion.article
      ref={cardRef}
      className="project-card"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="project-card-media">
        <img src={project.image} alt={project.title} loading="lazy" />
        <span className="project-card-category">{project.category}</span>
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>
        <div className="project-card-progress">
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              whileInView={{ width: `${project.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="progress-label">{project.progress}% funded</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectCards() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {
        // Keep fallback projects if the backend isn't reachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section projects-section" id="projects">
      <div className="container">
        <span className="eyebrow section-eyebrow">Where Your Gift Goes</span>
        <h2 className="section-title">Active Projects</h2>
        <div className="project-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.id || project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
