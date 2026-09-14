import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchDonations,
  fetchAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  BarChart3,
  FolderPlus,
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Layers,
  FileText,
} from 'lucide-react';
import './SimplePage.css';

const CHART_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests'); // requests | graphs | projects | blogs | calendar

  // Data states
  const [adminRequests, setAdminRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Modal states
  const [projectModal, setProjectModal] = useState({ open: false, data: null });
  const [blogModal, setBlogModal] = useState({ open: false, data: null });
  const [eventModal, setEventModal] = useState({ open: false, data: null });

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [reqsRes, projRes, blogRes, evRes, donRes] = await Promise.all([
        fetchAdminRequests().catch(() => ({ data: [] })),
        fetchProjects().catch(() => ({ data: [] })),
        fetchBlogs().catch(() => ({ data: [] })),
        fetchCalendarEvents().catch(() => ({ data: [] })),
        fetchDonations().catch(() => ({ data: [] })),
      ]);

      setAdminRequests(reqsRes?.data || []);
      setProjects(projRes?.data || []);
      setBlogs(blogRes?.data || []);
      setEvents(evRes?.data || []);
      setDonations(donRes?.data || []);
    } catch (err) {
      showMsg('error', 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }

  function showMsg(type, text) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
  }

  /* ---------------------------------------------------------------- */
  /* Admin Requests logic                                              */
  /* ---------------------------------------------------------------- */
  async function handleApproveAdmin(id) {
    try {
      await approveAdminRequest(id);
      showMsg('success', 'Admin request approved successfully!');
      setAdminRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to approve request');
    }
  }

  async function handleRejectAdmin(id) {
    try {
      await rejectAdminRequest(id);
      showMsg('success', 'Admin request rejected');
      setAdminRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to reject request');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Project CRUD logic                                                */
  /* ---------------------------------------------------------------- */
  async function handleSaveProject(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      target_amount: parseFloat(formData.get('target_amount')),
      status: formData.get('status'),
    };

    try {
      if (projectModal.data?.id) {
        await updateProject(projectModal.data.id, payload);
        showMsg('success', 'Project updated successfully');
      } else {
        await createProject(payload);
        showMsg('success', 'Project created successfully');
      }
      setProjectModal({ open: false, data: null });
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to save project');
    }
  }

  async function handleDeleteProject(id) {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      showMsg('success', 'Project deleted');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to delete project');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Blog CRUD logic                                                   */
  /* ---------------------------------------------------------------- */
  async function handleSaveBlog(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projId = formData.get('project_id');
    const payload = {
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      image_url: formData.get('image_url'),
      author: formData.get('author'),
      project_id: projId ? parseInt(projId, 10) : null,
    };

    try {
      if (blogModal.data?.id) {
        await updateBlog(blogModal.data.id, payload);
        showMsg('success', 'Blog post updated');
      } else {
        await createBlog(payload);
        showMsg('success', 'Blog post published');
      }
      setBlogModal({ open: false, data: null });
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to save blog post');
    }
  }

  async function handleDeleteBlog(id) {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteBlog(id);
      showMsg('success', 'Blog post deleted');
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to delete blog');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Calendar Event CRUD logic                                         */
  /* ---------------------------------------------------------------- */
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
        showMsg('success', 'Event updated successfully');
      } else {
        await createCalendarEvent(payload);
        showMsg('success', 'Event created successfully');
      }
      setEventModal({ open: false, data: null });
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to save event');
    }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteCalendarEvent(id);
      showMsg('success', 'Event deleted');
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      showMsg('error', err?.response?.data?.error || 'Failed to delete event');
    }
  }

  /* Chart data preparation */
  const projectChartData = projects.map((p) => ({
    name: p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title,
    Raised: p.raised_amount || 0,
    Target: p.target_amount || 0,
  }));

  const totalRaised = projects.reduce((acc, p) => acc + (p.raised_amount || 0), 0);

  return (
    <div className="simple-page" style={{ paddingBottom: '6rem' }}>
      <header className="page-hero" style={{ padding: '3.5rem 0 2.5rem 0' }}>
        <div className="container">
          <span className="eyebrow">Executive Console</span>
          <h1>Admin Control Dashboard</h1>
          <p>Manage projects, stories, team permissions, calendar events, and review donation analytics.</p>
        </div>
      </header>

      <section className="section simple-page-content" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          {/* Notification Banner */}
          {actionMsg.text && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                background: actionMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${actionMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {actionMsg.type === 'success' ? <CheckCircle color="#10B981" /> : <XCircle color="#EF4444" />}
              <span>{actionMsg.text}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="admin-stat-card">
              <DollarSign size={24} color="var(--color-amber)" />
              <div>
                <span className="admin-stat-label">Total Raised</span>
                <h3 className="admin-stat-val">${totalRaised.toLocaleString()}</h3>
              </div>
            </div>
            <div className="admin-stat-card">
              <Layers size={24} color="#10B981" />
              <div>
                <span className="admin-stat-label">Active Projects</span>
                <h3 className="admin-stat-val">{projects.length}</h3>
              </div>
            </div>
            <div className="admin-stat-card">
              <FileText size={24} color="#3B82F6" />
              <div>
                <span className="admin-stat-label">Published Blogs</span>
                <h3 className="admin-stat-val">{blogs.length}</h3>
              </div>
            </div>
            <div className="admin-stat-card">
              <Clock size={24} color="#EC4899" />
              <div>
                <span className="admin-stat-label">Pending Admins</span>
                <h3 className="admin-stat-val">{adminRequests.length}</h3>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'requests' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Users size={18} /> Admin Requests ({adminRequests.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'graphs' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('graphs')}
            >
              <BarChart3 size={18} /> Donation Graphs
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'projects' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <FolderPlus size={18} /> Projects ({projects.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'blogs' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('blogs')}
            >
              <BookOpen size={18} /> Blogs ({blogs.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'calendar' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <CalendarIcon size={18} /> Calendar ({events.length})
            </button>
          </div>

          {/* Tab 1: Admin Requests */}
          {activeTab === 'requests' && (
            <div className="admin-tab-panel">
              <h2 className="admin-panel-title">Pending Administrator Sign-Up Requests</h2>
              {adminRequests.length === 0 ? (
                <p style={{ color: '#CBD5E1' }}>No pending admin registration requests at this time.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {adminRequests.map((req) => (
                    <div key={req.id} className="admin-request-card">
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{req.name}</h4>
                        <p style={{ color: '#CBD5E1', fontSize: '0.9rem', margin: 0 }}>{req.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                          className="btn"
                          style={{ background: '#10B981', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleApproveAdmin(req.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn"
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: '1px solid #EF4444', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleRejectAdmin(req.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Donation Graphs */}
          {activeTab === 'graphs' && (
            <div className="admin-tab-panel">
              <h2 className="admin-panel-title">Donation & Fundraising Visualizations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--color-hairline)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>Raised vs Target per Project</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectChartData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="Raised" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Target" fill="#334155" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--color-hairline)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>Project Distribution</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={projectChartData} dataKey="Raised" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {projectChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Project Management */}
          {activeTab === 'projects' && (
            <div className="admin-tab-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="admin-panel-title" style={{ margin: 0 }}>Project Management</h2>
                <button
                  className="btn btn-donate"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
                  onClick={() => setProjectModal({ open: true, data: null })}
                >
                  <Plus size={16} /> Add New Project
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Target Amount</th>
                      <th>Raised Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{p.title}</td>
                        <td>${(p.target_amount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--color-amber)' }}>${(p.raised_amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`status-pill ${p.status}`}>{p.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="icon-btn"
                              onClick={() => setProjectModal({ open: true, data: p })}
                            >
                              <Edit2 size={16} color="var(--color-amber)" />
                            </button>
                            <button className="icon-btn" onClick={() => handleDeleteProject(p.id)}>
                              <Trash2 size={16} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Blog Management */}
          {activeTab === 'blogs' && (
            <div className="admin-tab-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="admin-panel-title" style={{ margin: 0 }}>Blog & Story Management</h2>
                <button
                  className="btn btn-donate"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
                  onClick={() => setBlogModal({ open: true, data: null })}
                >
                  <Plus size={16} /> Write Blog Post
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Linked Project</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.project_title || 'None'}</td>
                        <td>{b.created_at?.slice(0, 10)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-btn" onClick={() => setBlogModal({ open: true, data: b })}>
                              <Edit2 size={16} color="var(--color-amber)" />
                            </button>
                            <button className="icon-btn" onClick={() => handleDeleteBlog(b.id)}>
                              <Trash2 size={16} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Calendar Management */}
          {activeTab === 'calendar' && (
            <div className="admin-tab-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="admin-panel-title" style={{ margin: 0 }}>Calendar Event Management</h2>
                <button
                  className="btn btn-donate"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
                  onClick={() => setEventModal({ open: true, data: null })}
                >
                  <Plus size={16} /> Add New Event
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Location</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{ev.title}</td>
                        <td>{ev.location || 'N/A'}</td>
                        <td>{ev.start_time?.replace('T', ' ').slice(0, 16)}</td>
                        <td>{ev.end_time?.replace('T', ' ').slice(0, 16)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="icon-btn" onClick={() => setEventModal({ open: true, data: ev })}>
                              <Edit2 size={16} color="var(--color-amber)" />
                            </button>
                            <button className="icon-btn" onClick={() => handleDeleteEvent(ev.id)}>
                              <Trash2 size={16} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      {projectModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setProjectModal({ open: false, data: null })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{projectModal.data ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSaveProject}>
              <label className="field-label">Project Title</label>
              <input name="title" defaultValue={projectModal.data?.title || ''} className="field-input" required />

              <label className="field-label">Description</label>
              <textarea name="description" defaultValue={projectModal.data?.description || ''} className="field-input" rows={4} required />

              <label className="field-label">Target Amount ($)</label>
              <input name="target_amount" type="number" step="0.01" defaultValue={projectModal.data?.target_amount || ''} className="field-input" required />

              <label className="field-label">Status</label>
              <select name="status" defaultValue={projectModal.data?.status || 'active'} className="field-input" style={{ background: '#1e293b', color: '#fff' }}>
                <option value="active">active</option>
                <option value="completed">completed</option>
                <option value="suspended">suspended</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn navbar-ghost" onClick={() => setProjectModal({ open: false, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-donate">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {blogModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setBlogModal({ open: false, data: null })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{blogModal.data ? 'Edit Blog Post' : 'Write & Publish Blog Post'}</h3>
            <form onSubmit={handleSaveBlog}>
              <label className="field-label">Article Title</label>
              <input name="title" defaultValue={blogModal.data?.title || ''} className="field-input" required />

              <label className="field-label">Author</label>
              <input name="author" defaultValue={blogModal.data?.author || 'Atlanta Hope Team'} className="field-input" required />

              <label className="field-label">Image URL</label>
              <input name="image_url" defaultValue={blogModal.data?.image_url || ''} className="field-input" placeholder="https://images.unsplash.com/..." />

              <label className="field-label">Link to Project (Optional)</label>
              <select name="project_id" defaultValue={blogModal.data?.project_id || ''} className="field-input" style={{ background: '#1e293b', color: '#fff' }}>
                <option value="">-- No Linked Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              <label className="field-label">Short Excerpt</label>
              <input name="excerpt" defaultValue={blogModal.data?.excerpt || ''} className="field-input" placeholder="Brief 1-2 sentence summary" />

              <label className="field-label">Full Article Content</label>
              <textarea name="content" defaultValue={blogModal.data?.content || ''} className="field-input" rows={6} required />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn navbar-ghost" onClick={() => setBlogModal({ open: false, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-donate">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Event Modal */}
      {eventModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setEventModal({ open: false, data: null })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{eventModal.data ? 'Edit Calendar Event' : 'Create Calendar Event'}</h3>
            <form onSubmit={handleSaveEvent}>
              <label className="field-label">Event Title</label>
              <input name="title" defaultValue={eventModal.data?.title || ''} className="field-input" required />

              <label className="field-label">Location</label>
              <input name="location" defaultValue={eventModal.data?.location || ''} className="field-input" placeholder="e.g. Community Center or Online" />

              <label className="field-label">Start Time (YYYY-MM-DDTHH:MM)</label>
              <input name="start_time" type="datetime-local" defaultValue={eventModal.data?.start_time ? eventModal.data.start_time.slice(0, 16) : ''} className="field-input" required />

              <label className="field-label">End Time (YYYY-MM-DDTHH:MM)</label>
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
