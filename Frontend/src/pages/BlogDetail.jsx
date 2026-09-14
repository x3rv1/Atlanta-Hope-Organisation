import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchBlogDetails } from '../api/client';
import { ArrowLeft, Calendar, User, HeartHandshake, ChevronRight } from 'lucide-react';
import './SimplePage.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchBlogDetails(id)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        setBlog(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.error || 'Blog post not found.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="simple-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-slate)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto', width: '40px', height: '40px', border: '3px solid var(--color-hairline)', borderTopColor: 'var(--color-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Loading blog post…</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="simple-page" style={{ minHeight: '70vh', padding: '6rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>Article Not Found</h2>
          <p style={{ color: 'var(--color-slate)', marginBottom: '2rem' }}>{error || "The blog post you requested does not exist."}</p>
          <button className="btn btn-explore" onClick={() => navigate('/blog')}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const img = blog.image_url || 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80';
  const dateStr = blog.created_at ? blog.created_at.slice(0, 10) : 'Field Update';

  return (
    <div className="simple-page" style={{ paddingBottom: '6rem' }}>
      <header className="page-hero" style={{ padding: '3.5rem 0 2.5rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <button 
            onClick={() => navigate('/blog')} 
            style={{ background: 'none', border: 'none', color: 'var(--color-amber)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Back to Blog Updates
          </button>
          
          <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--color-slate)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="var(--color-amber)" /> {dateStr}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><User size={15} color="var(--color-amber)" /> {blog.author || 'Atlanta Hope Team'}</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', lineHeight: '1.3', color: '#fff' }}>{blog.title}</h1>
        </div>
      </header>

      <section className="section simple-page-content" style={{ paddingTop: '1rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Main Image */}
          <div style={{ width: '100%', maxHeight: '420px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid var(--color-hairline)' }}>
            <img src={img} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Linked Project Banner (if present) */}
          {blog.project_id && (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HeartHandshake size={24} color="var(--color-amber)" />
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-amber)', letterSpacing: '0.5px' }}>Linked Project Initiative</span>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{blog.project_title || `Project #${blog.project_id}`}</h4>
                </div>
              </div>
              <Link to={`/projects/${blog.project_id}`} style={{ textDecoration: 'none', color: 'var(--color-amber)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem' }}>
                View Project <ChevronRight size={18} />
              </Link>
            </motion.div>
          )}

          {/* Article Body Content */}
          <div style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '1.15rem', lineHeight: '1.95', whiteSpace: 'pre-line', background: 'var(--color-charcoal-soft)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--color-hairline)' }}>
            {blog.content}
          </div>
        </div>
      </section>
    </div>
  );
}
