import React from 'react';
import ProjectCards from '../components/ProjectCards';
import './SimplePage.css';

export default function ProjectsPage() {
  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">All Projects</span>
          <h1>Every Project, Fully Transparent</h1>
          <p>Browse everything Atlanta Hope Organisation is currently funding — and how far each one has come.</p>
        </div>
      </header>
      <ProjectCards />
    </div>
  );
}
