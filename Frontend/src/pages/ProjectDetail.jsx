import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProjectDetails } from '../api/client';
import { ArrowLeft, Heart, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import './SimplePage.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProjectDetails(id)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        setProject(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.error || 'Project not found or failed to load.');
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
          <p>Loading project details…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="simple-page" style={{ minHeight: '70vh', padding: '6rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>Project Not Found</h2>
          <p style={{ color: 'var(--color-slate)', marginBottom: '2rem' }}>{error || "The project you are looking for does not exist or has been removed."}</p>
          <button className="btn btn-explore" onClick={() => navigate('/projects')}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const targetAmount = project.target_amount || 0;
  const raisedAmount = project.raised_amount || 0;
  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100)) : 0;
  const blogs = project.blogs || [];
  const donations = project.donations || [];
  const projectImg = project.image_url || project.image || 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="simple-page" style={{ paddingBottom: '6rem' }}>
      <header className="page-hero" style={{ padding: '4rem 0 3.5rem 0', background: 'var(--gradient-hero)', borderBottom: '1px solid var(--color-hairline)' }}>
        <div className="container">
          <button 
            onClick={() => navigate('/projects')} 
            style={{ background: 'none', border: 'none', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="eyebrow" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              {project.status?.toUpperCase() || 'ACTIVE PROJECT'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', margin: '0.75rem 0 1rem 0', color: '#FFFFFF', fontWeight: 800 }}>{project.title}</h1>
        </div>
      </header>

      <section className="section simple-page-content" style={{ paddingTop: '2rem' }}>
        <div className="container">
          {/* Project Hero Image */}
          <div style={{ width: '100%', height: '420px', borderRadius: '20px', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid var(--color-hairline)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <img src={projectImg} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Overview Card */}
            <div style={{ background: 'var(--color-charcoal-soft, #1E293B)', borderRadius: '16px', border: '1px solid var(--color-hairline)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>About This Initiative</h2>
              <p style={{ color: '#CBD5E1', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                {project.description}
              </p>
            </div>

            {/* Related Blog Posts Section */}
            <div style={{ background: 'var(--color-charcoal-soft, #1E293B)', borderRadius: '16px', border: '1px solid var(--color-hairline)', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <FileText size={22} color="#F59E0B" />
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#fff' }}>Field Reports & Blog Updates</h2>
              </div>

              {blogs.length === 0 ? (
                <p style={{ color: '#CBD5E1', fontStyle: 'italic' }}>No blog posts linked to this project yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {blogs.map((blog) => (
                    <motion.div 
                      key={blog.id}
                      whileHover={{ x: 6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid var(--color-hairline)' }}
                    >
                      <Link to={`/blog/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 style={{ fontSize: '1.15rem', color: '#F59E0B', marginBottom: '0.5rem' }}>{blog.title}</h4>
                        <p style={{ fontSize: '0.98rem', color: '#CBD5E1', marginBottom: '0.75rem', lineHeight: '1.5' }}>{blog.excerpt}</p>
                        <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <User size={12} color="#F59E0B" /> {blog.author} • <Calendar size={12} color="#F59E0B" /> {blog.created_at?.slice(0, 10)}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Fundraising Card */}
            <div style={{ background: 'var(--color-charcoal-soft, #1E293B)', borderRadius: '16px', border: '1px solid var(--color-hairline)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#F59E0B', fontWeight: 600 }}>Fundraising Goal</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff' }}>${raisedAmount.toLocaleString()}</span>
                  <span style={{ color: '#94A3B8', fontSize: '1.1rem' }}>/ ${targetAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #f59e0b)', borderRadius: '999px', transition: 'width 1s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem', color: '#CBD5E1' }}>
                  <span>{progressPercent}% Funded</span>
                  <span>{donations.length} Contributions</span>
                </div>
              </div>

              <button 
                className="btn btn-donate" 
                onClick={() => navigate('/donate')} 
                style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}
              >
                <Heart size={20} fill="currentColor" /> Donate to this Project
              </button>
            </div>

            {/* Recent Donors List */}
            <div style={{ background: 'var(--color-charcoal-soft, #1E293B)', borderRadius: '16px', border: '1px solid var(--color-hairline)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#F59E0B" /> Recent Supporters
              </h3>
              {donations.length === 0 ? (
                <p style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>Be the first to donate to this project!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {donations.slice(0, 5).map((d, idx) => (
                    <div key={d.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.68rem 0.9rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{d.donor_name}</span>
                      <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.95rem' }}>${d.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);
}
