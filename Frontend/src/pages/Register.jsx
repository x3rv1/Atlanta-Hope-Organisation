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
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await register({ name, email, password, role });
      if (role === 'admin') {
        setMessage('Registration successful! Your admin account is pending approval by an administrator.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not create your account.');
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

        <label className="field-label" htmlFor="role">Account Type</label>
        <select
          id="role"
          className="field-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ background: 'var(--color-charcoal-soft)', color: 'var(--color-white)', border: '1px solid var(--color-hairline)' }}
        >
          <option value="user" style={{ background: 'var(--color-charcoal)' }}>Normal User</option>
          <option value="admin" style={{ background: 'var(--color-charcoal)' }}>Admin (Requires Approval)</option>
        </select>

        {error && <p className="auth-error">{error}</p>}
        {message && <div style={{ color: '#10b981', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

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
