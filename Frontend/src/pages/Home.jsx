import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ProjectCards from '../components/ProjectCards';
import SupporterCards from '../components/SupporterCards';
import DonationForm from '../components/DonationForm';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        onDonateClick={() => navigate('/donate')}
        onExploreClick={() => {
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ProjectCards />

      <div className="kinship-divider">
        <span /><div className="line" /><span /><div className="line" /><span />
      </div>

      <SupporterCards />

      <section className="section donate-cta-section">
        <div className="container donate-cta-inner">
          <div className="donate-cta-copy">
            <span className="eyebrow section-eyebrow">Ready When You Are</span>
            <h2 className="section-title">Fund a Project Today</h2>
            <p className="donate-cta-text">
              KES 500 covers a week of meals for one family. KES 2,500 supplies a
              classroom's worth of reading books. Every amount is tracked back to a
              named project.
            </p>
          </div>
          <DonationForm />
        </div>
      </section>
    </>
  );
}
