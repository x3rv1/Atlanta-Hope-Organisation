import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchBlogs } from '../api/client';
import { Calendar, User, ArrowRight } from 'lucide-react';
import './SimplePage.css';

const FALLBACK_POSTS = [
  {
    id: 1,
    title: 'Clean Water Reaches 500 Families',
    excerpt: 'Our latest shipment of water filters arrived safely last week! Thanks to generous donor contributions.',
    author: 'Director Marcus Vance',
    image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-08-01',
  },
  {
    id: 2,
    title: 'Literacy Lab Opens Its Doors',
    excerpt: 'We officially launched the Youth Literacy & STEM Lab yesterday. Students received new laptop tablets and coding workbooks.',
    author: 'Elena Rostova',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-07-20',
  },
  {
    id: 3,
    title: '5,000 Hot Meals Delivered This Quarter',
    excerpt: 'Thanks to our Westside volunteers and kitchen team, we hit a major milestone of delivering 5,000 warm meals.',
    author: 'Atlanta Hope Team',
    image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-06-15',
  },
];

export default function Blog() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchBlogs()
      .then((res) => {
        const data = res?.data || res;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(() => {
        // Keep fallback posts
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">Updates & Field Reports</span>
          <h1>Stories From the Field</h1>
          <p>Reporting on how donations turn into real, transparent outcomes across Atlanta and global initiatives.</p>
        </div>
      </header>

      <section className="section simple-page-content">
        <div className="container blog-grid">
          {posts.map((post) => {
            const img = post.image_url || post.image || 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80';
            const dateStr = post.created_at ? post.created_at.slice(0, 10) : (post.date || 'Recent');

            return (
              <motion.article
                className="blog-card"
                key={post.id}
                whileHover={{ y: -8, boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.6)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                onClick={() => navigate(`/blog/${post.id}`)}
                style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={img}
                    alt={post.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                </div>
                <div className="blog-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} color="#F59E0B" /> {dateStr}</span>
                      {post.author && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><User size={14} color="#F59E0B" /> {post.author}</span>}
                    </div>
                    <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ color: '#CBD5E1', fontSize: '0.98rem', lineHeight: '1.65' }}>{post.excerpt}</p>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 600, fontSize: '0.95rem' }}>
                    Read Article <ArrowRight size={16} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
