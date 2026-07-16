import React from 'react';
import './SimplePage.css';

const POSTS = [
  {
    id: 1,
    date: 'June 2026',
    title: 'Inside the Westside Meal Program',
    excerpt: 'How 40 volunteers now serve 400 families a week.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    date: 'May 2026',
    title: 'What KES 500 Actually Funds',
    excerpt: 'A transparent breakdown of where every donation tier goes.',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    date: 'April 2026',
    title: 'Youth Literacy Lab: Term One Results',
    excerpt: 'Reading scores across our first cohort of 150 students.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Blog() {
  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">Updates</span>
          <h1>Stories From the Field</h1>
          <p>Reporting on how donations turn into real outcomes across Atlanta.</p>
        </div>
      </header>

      <section className="section simple-page-content">
        <div className="container blog-grid">
          {POSTS.map((post) => (
            <article className="blog-card" key={post.id}>
              <img src={post.image} alt={post.title} loading="lazy" />
              <div className="blog-card-body">
                <span className="blog-card-date">{post.date}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
