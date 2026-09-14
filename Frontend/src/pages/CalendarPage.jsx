import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Edit2, Trash2, Shield, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './SimplePage.css';

export default function CalendarPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModal, setEventModal] = useState({ open: false, data: null });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetchCalendarEvents();
      const data = res?.data || res;
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEvent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      location: formData.get('location'),
    };

    try {
      if (eventModal.data?.id) {
        await updateCalendarEvent(eventModal.data.id, payload);
      } else {
        await createCalendarEvent(payload);
      }
      setEventModal({ open: false, data: null });
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save calendar event');
    }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteCalendarEvent(id);
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete event');
    }
  }

  // Month navigation helpers
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  return (
    <div className="simple-page" style={{ paddingBottom: '6rem' }}>
      <header className="page-hero" style={{ padding: '3.5rem 0 2.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="eyebrow">Community & Event Schedule</span>
            <h1>Organisation Calendar</h1>
            <p>Upcoming outreach drives, fundraising workshops, and community meetings.</p>
          </div>
          {isAdmin && (
            <button
              className="btn btn-donate"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setEventModal({ open: true, data: null })}
            >
              <Plus size={18} /> Schedule New Event
            </button>
          )}
        </div>
      </header>

      <section className="section simple-page-content" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-charcoal-soft)', padding: '1rem 1.5rem', borderRadius: '14px', border: '1px solid var(--color-hairline)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarIcon color="var(--color-amber)" /> {monthName}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="icon-btn" onClick={prevMonth} aria-label="Previous Month">
                <ChevronLeft size={20} color="#fff" />
              </button>
              <button className="icon-btn" onClick={nextMonth} aria-label="Next Month">
                <ChevronRight size={20} color="#fff" />
              </button>
            </div>
          </div>

          {/* Role Access Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--color-hairline)', fontSize: '0.9rem', color: 'var(--color-slate)' }}>
            <Shield size={16} color="var(--color-amber)" />
            <span>
              {isAdmin ? 'Admin Mode Active: You have full permissions to add, edit, and delete events.' : 'User View Mode: Logged-in users can view all scheduled events.'}
            </span>
          </div>

          {/* Event Cards Grid */}
          {loading ? (
            <p style={{ color: 'var(--color-slate)', textAlign: 'center', padding: '3rem' }}>Loading calendar events…</p>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--color-charcoal-soft)', borderRadius: '16px', border: '1px solid var(--color-hairline)' }}>
              <CalendarIcon size={48} color="var(--color-slate)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#fff' }}>No Scheduled Events</h3>
              <p style={{ color: 'var(--color-slate)' }}>Check back soon or ask an admin to add upcoming events.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {events.map((ev) => {
                const startDate = ev.start_time ? new Date(ev.start_time) : null;
                const formattedDate = startDate ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD';
                const formattedTime = startDate ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD';

                return (
                  <motion.div
                    key={ev.id}
                    className="event-card"
                    whileHover={{ y: -6, boxShadow: '0 15px 25px -10px rgba(0,0,0,0.5)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    style={{
                      background: 'var(--color-charcoal-soft)',
                      borderRadius: '16px',
                      border: '1px solid var(--color-hairline)',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.15)', color: 'var(--color-amber)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                          {formattedDate}
                        </span>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="icon-btn" onClick={() => setEventModal({ open: true, data: ev })} title="Edit Event">
                              <Edit2 size={14} color="var(--color-amber)" />
                            </button>
                            <button className="icon-btn" onClick={() => handleDeleteEvent(ev.id)} title="Delete Event">
                              <Trash2 size={14} color="#EF4444" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem' }}>{ev.title}</h3>

                      <p style={{ color: 'var(--color-slate)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                        {ev.description || 'No additional details provided.'}
                      </p>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-hairline)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="var(--color-amber)" /> {formattedTime}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--color-amber)" /> {ev.location || 'Location to be announced'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Admin Event Modal */}
      {isAdmin && eventModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setEventModal({ open: false, data: null })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{eventModal.data ? 'Edit Event' : 'Add New Event'}</h3>
            <form onSubmit={handleSaveEvent}>
              <label className="field-label">Event Title</label>
              <input name="title" defaultValue={eventModal.data?.title || ''} className="field-input" required />

              <label className="field-label">Location</label>
              <input name="location" defaultValue={eventModal.data?.location || ''} className="field-input" placeholder="e.g. Grand Ballroom or Zoom" />

              <label className="field-label">Start Time</label>
              <input name="start_time" type="datetime-local" defaultValue={eventModal.data?.start_time ? eventModal.data.start_time.slice(0, 16) : ''} className="field-input" required />

              <label className="field-label">End Time</label>
              <input name="end_time" type="datetime-local" defaultValue={eventModal.data?.end_time ? eventModal.data.end_time.slice(0, 16) : ''} className="field-input" required />

              <label className="field-label">Description</label>
              <textarea name="description" defaultValue={eventModal.data?.description || ''} className="field-input" rows={3} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn navbar-ghost" onClick={() => setEventModal({ open: false, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-donate">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
