import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchProjects } from '../api/client';
import './ProjectCards.css';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: 'Clean Water Initiative',
    category: 'Water & Health',
    description: 'Providing filters and clean water access to rural communities in Kenya.',
    target_amount: 15000,
    raised_amount: 4500,
    progress: 30,
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Youth Literacy & STEM Lab',
    category: 'Education',
    description: 'After-school reading, laptops, and mentorship for youth in under-resourced schools.',
    target_amount: 8000,
    raised_amount: 5200,
    progress: 65,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Community Food Drive',
    category: 'Food Security',
    description: 'Providing hot nutritious meals and family emergency food packages in Atlanta.',
    target_amount: 5000,
    raised_amount: 5000,
    progress: 100,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
  },
];

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();

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

  const progress = project.progress !== undefined 
    ? project.progress 
    : project.target_amount > 0 
      ? Math.min(100, Math.round((project.raised_amount / project.target_amount) * 100)) 
      : 0;

  const defaultImage = project.image_url || project.image || 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.article
      ref={cardRef}
      className="project-card"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="project-card-media">
        <img src={defaultImage} alt={project.title} loading="lazy" />
        <span className="project-card-category">{project.category || project.status || 'Active'}</span>
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>
        <div className="project-card-progress">
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.85rem' }}>
            <span className="progress-label">{progress}% funded</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>
              ${(project.raised_amount || 0).toLocaleString()} / ${(project.target_amount || 0).toLocaleString()}
            </span>
          </div>
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
      .then((res) => {
        const data = res?.data || res;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {
        // Keep fallback projects if backend unavailable
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
