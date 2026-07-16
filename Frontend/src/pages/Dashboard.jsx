import React, { useEffect, useState } from 'react';
import { fetchDonations } from '../api/client';
import './SimplePage.css';

export default function Dashboard() {
  const [donations, setDonations] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetchDonations()
      .then((data) => {
        setDonations(Array.isArray(data) ? data : []);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="simple-page">
      <header className="page-hero">
        <div className="container">
          <span className="eyebrow">Your Account</span>
          <h1>Donation History</h1>
          <p>A record of your gifts to Atlanta Hope Organisation and the projects they funded.</p>
        </div>
      </header>

      <section className="section simple-page-content">
        <div className="container">
          {status === 'loading' && <p>Loading your donation history…</p>}
          {status === 'error' && <p>We couldn't load your donations right now. Please try again shortly.</p>}
          {status === 'loaded' && donations.length === 0 && <p>No donations yet — every gift will show up here.</p>}
          {status === 'loaded' && donations.length > 0 && (
            <ul>
              {donations.map((d) => (
                <li key={d.id}>
                  KES {d.amount} — {d.projectName || 'General Fund'} — {d.date}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
