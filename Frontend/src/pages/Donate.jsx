import React from 'react';
import DonationForm from '../components/DonationForm';
import './SimplePage.css';
import './Donate.css';

export default function Donate() {
  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">Give Today</span>
          <h1>Fund a Real Project</h1>
          <p>Pay by M-Pesa in under a minute. You'll receive an STK push prompt to confirm.</p>
        </div>
      </header>

      <section className="section donate-page-section">
        <div className="container donate-page-inner">
          <DonationForm />
        </div>
      </section>
    </div>
  );
}
