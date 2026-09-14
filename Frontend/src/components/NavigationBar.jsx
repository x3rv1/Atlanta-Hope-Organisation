import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: '/calendar', label: 'Calendar' });
  }

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin Dashboard' });
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-brand">
          Atlanta Hope
        </NavLink>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-amber)', fontWeight: 500 }}>
                {user?.name?.split(' ')[0] || 'User'} {user?.role === 'admin' ? '(Admin)' : ''}
              </span>
              <button className="navbar-ghost" onClick={logout}>
                Log Out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar-ghost">
              Log In
            </NavLink>
          )}
          <button className="navbar-donate" onClick={() => navigate('/donate')}>
            Donate
          </button>
        </div>

        <button
          className="navbar-burger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="navbar-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/donate" className="navbar-mobile-link is-donate" onClick={() => setMenuOpen(false)}>
              Donate
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
