import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { initiateMpesaStkPush } from '../api/client';
import './DonationForm.css';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const STATUS = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

function validatePhone(phone) {
  // Accepts 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX / 2541XXXXXXXX
  return /^(?:254|0)(7|1)\d{8}$/.test(phone.trim());
}

export default function DonationForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [message, setMessage] = useState('');

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (!validatePhone(phoneNumber)) {
      setStatus(STATUS.ERROR);
      setMessage('Enter a valid Safaricom number, e.g. 0712345678.');
      return;
    }
    if (!effectiveAmount || effectiveAmount < 10) {
      setStatus(STATUS.ERROR);
      setMessage('Enter an amount of at least KES 10.');
      return;
    }

    setStatus(STATUS.SUBMITTING);
    try {
      const response = await initiateMpesaStkPush({
        phoneNumber: phoneNumber.trim(),
        amount: effectiveAmount,
      });
      setStatus(STATUS.SUCCESS);
      setMessage(
        response?.message ||
          'Check your phone — enter your M-Pesa PIN to complete the donation.'
      );
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage(
        err?.response?.data?.message ||
          'We could not reach M-Pesa right now. Please try again in a moment.'
      );
    }
  }

  return (
    <motion.form
      className="donation-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="eyebrow donation-eyebrow">Give via M-Pesa</span>
      <h3 className="donation-title">Make a Donation</h3>
      <p className="donation-copy">
        Enter your number and amount — you'll get an STK push prompt on your phone to
        confirm with your M-Pesa PIN.
      </p>

      <div className="donation-amounts">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            type="button"
            key={preset}
            className={`amount-chip ${amount === preset && !customAmount ? 'is-active' : ''}`}
            onClick={() => {
              setAmount(preset);
              setCustomAmount('');
            }}
          >
            KES {preset.toLocaleString()}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="custom-amount">
        Or enter a custom amount (KES)
      </label>
      <input
        id="custom-amount"
        type="number"
        min="10"
        placeholder="e.g. 1500"
        className="field-input"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
      />

      <label className="field-label" htmlFor="phone-number">
        M-Pesa phone number
      </label>
      <input
        id="phone-number"
        type="tel"
        placeholder="07XXXXXXXX"
        className="field-input"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />

      <button type="submit" className="btn donation-submit" disabled={status === STATUS.SUBMITTING}>
        {status === STATUS.SUBMITTING ? 'Sending prompt…' : `Donate KES ${effectiveAmount || 0}`}
      </button>

      {message && (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`donation-message ${status === STATUS.SUCCESS ? 'is-success' : 'is-error'}`}
          role="status"
        >
          {message}
        </motion.p>
      )}
    </motion.form>
  );
}
