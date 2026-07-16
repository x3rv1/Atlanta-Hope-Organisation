import React from 'react';
import './SimplePage.css';

const VALUES = [
  {
    title: 'Transparency',
    body: 'Every donation is tagged to a named project with public progress tracking.',
  },
  {
    title: 'Community-Led',
    body: 'Projects are proposed and prioritized by the neighborhoods they serve.',
  },
  {
    title: 'Accountability',
    body: 'Quarterly impact reports are published for every active initiative.',
  },
];

export default function About() {
  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Story</span>
          <h1>Built By and For Atlanta</h1>
          <p>
            Atlanta Hope Organisation started as a single meal drive in Westside Atlanta
            and has grown into a network of community-led projects across the city.
          </p>
        </div>
      </header>

      <section className="section simple-page-content">
        <div className="container about-grid">
          <div>
            {VALUES.map((v) => (
              <div className="about-value" key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=900&q=80"
              alt="Atlanta Hope Organisation team at a community project site"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
