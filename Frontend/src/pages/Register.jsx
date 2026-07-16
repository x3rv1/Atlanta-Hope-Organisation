import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Your Account</h1>
        <p className="auth-sub">Join Atlanta Hope Organisation as a registered supporter.</p>

        <label className="field-label" htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn donation-submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already registered? <NavLink to="/login">Log in</NavLink>
        </p>
      </form>
    </div>
  );
}
