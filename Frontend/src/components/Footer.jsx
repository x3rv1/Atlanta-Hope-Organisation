import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">Atlanta Hope</p>
          <p className="footer-tagline">Together we empower communities, one donation at a time.</p>
        </div>

        <div className="footer-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/donate">Donate</NavLink>
        </div>
      </div>
      <div className="container">
        <p className="footer-copy">© {new Date().getFullYear()} Atlanta Hope Organisation. All rights reserved.</p>
      </div>
    </footer>
  );
}
