import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { initiateMpesaStkPush, checkMpesaStatus } from '../api/client';
import './DonationForm.css';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const STATUS = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  WAITING_FOR_PIN: 'waiting_for_pin',
  SUCCESS: 'success',
  ERROR: 'error',
};

function validatePhone(phone) {
  // Accepts 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX / 2541XXXXXXXX
  return /^(?:254|0)(7|1)\d{8}$/.test(phone.trim());
}

export default function DonationForm({ projectId = null }) {
  const [donorName, setDonorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [message, setMessage] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  
  const pollTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const startPollingStatus = (checkoutRequestId) => {
    let attempts = 0;
    const maxAttempts = 15; // 15 attempts * 3s = 45 seconds total

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await checkMpesaStatus(checkoutRequestId);
        const txn = res?.data;

        if (txn?.status === 'completed') {
          clearInterval(pollTimerRef.current);
          setStatus(STATUS.SUCCESS);
          setReceiptNumber(txn.mpesa_receipt_number || '');
          setMessage(
            txn.mpesa_receipt_number
              ? `Payment confirmed! Receipt: ${txn.mpesa_receipt_number}. Thank you for your support!`
              : 'Payment confirmed! Thank you for your support!'
          );
        } else if (txn?.status === 'failed') {
          clearInterval(pollTimerRef.current);
          setStatus(STATUS.ERROR);
          setMessage(txn.result_desc || 'Payment request was cancelled or failed.');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollTimerRef.current);
          // Don't mark strictly failed, but inform user to check M-Pesa SMS
          setStatus(STATUS.SUCCESS);
          setMessage('Prompt sent! Once you complete the PIN prompt on your phone, your donation will be updated automatically.');
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(pollTimerRef.current);
        }
      }
    }, 3000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setReceiptNumber('');

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
        donorName: donorName.trim() || undefined,
        projectId,
      });

      const checkoutRequestId = response?.CheckoutRequestID;
      if (checkoutRequestId) {
        setStatus(STATUS.WAITING_FOR_PIN);
        setMessage(`STK push sent to ${phoneNumber.trim()}! Please enter your M-Pesa PIN on your phone.`);
        startPollingStatus(checkoutRequestId);
      } else {
        setStatus(STATUS.SUCCESS);
        setMessage('Check your phone — enter your M-Pesa PIN to complete the donation.');
      }
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage(
        err?.response?.data?.error ||
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

      <label className="field-label" htmlFor="donor-name">
        Your Name (Optional)
      </label>
      <input
        id="donor-name"
        type="text"
        placeholder="e.g. Jane Doe"
        className="field-input"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
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

      <button
        type="submit"
        className="btn donation-submit"
        disabled={status === STATUS.SUBMITTING || status === STATUS.WAITING_FOR_PIN}
      >
        {status === STATUS.SUBMITTING
          ? 'Sending prompt…'
          : status === STATUS.WAITING_FOR_PIN
          ? 'Waiting for M-Pesa PIN…'
          : `Donate KES ${effectiveAmount || 0}`}
      </button>

      {message && (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`donation-message ${
            status === STATUS.SUCCESS
              ? 'is-success'
              : status === STATUS.WAITING_FOR_PIN
              ? 'is-info'
              : 'is-error'
          }`}
          role="status"
        >
          {message}
        </motion.p>
      )}
    </motion.form>
  );
}
