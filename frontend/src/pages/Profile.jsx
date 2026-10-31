import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Save, Award, CheckCircle, BookOpen } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '3rd Year',
    bio: user?.bio || '',
    experience_years: user?.experience_years || 1.0,
    availability: user?.availability || 'Flexible'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.put('/users/profile', {
        ...formData,
        experience_years: parseFloat(formData.experience_years)
      });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><User size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Student Profile</h1>
        <p className="page-subtitle">Manage your personal details, academic background, availability, and experience for mentor matching</p>
      </div>

      <div className="profile-layout grid-2">
        <div className="glass-card">
          <h3>Profile Overview</h3>
          <p className="card-subtitle">Public mentoring profile details visible to peers</p>

          <div className="profile-badge-box">
            <div className="user-avatar-lg">
              <User size={36} color="#818cf8" />
            </div>
            <div>
              <h2>{user?.name}</h2>
              <p className="text-muted">{user?.email}</p>
              <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{user?.college}</span>
                <span className="badge badge-cyan">{user?.department}</span>
                <span className="badge badge-amber"><Award size={12} /> {user?.rating || 5.0}★ Rating</span>
              </div>
            </div>
          </div>

          <div className="info-summary">
            <div className="info-item">
              <span className="info-lbl">Academic Year:</span>
              <span className="info-val">{user?.year}</span>
            </div>
            <div className="info-item">
              <span className="info-lbl">Availability:</span>
              <span className="info-val">{user?.availability}</span>
            </div>
            <div className="info-item">
              <span className="info-lbl">Mentoring Experience:</span>
              <span className="info-val">{user?.experience_years} Years</span>
            </div>
            <div className="info-item">
              <span className="info-lbl">Completed Mentoring Sessions:</span>
              <span className="info-val">{user?.mentoring_count || 0} Sessions</span>
            </div>
          </div>

          <div className="skills-summary-box">
            <h4><BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Skills You Can Teach</h4>
            <div className="skills-tags">
              {user?.teach_skills?.length > 0 ? (
                user.teach_skills.map(s => <span key={s} className="badge badge-emerald">{s}</span>)
              ) : (
                <small className="text-dim">No teaching skills specified yet.</small>
              )}
            </div>

            <h4 style={{ marginTop: '1rem' }}><BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Skills You Want to Learn</h4>
            <div className="skills-tags">
              {user?.learn_skills?.length > 0 ? (
                user.learn_skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)
              ) : (
                <small className="text-dim">No learning skills specified yet.</small>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="glass-card">
          <h3>Edit Profile Information</h3>
          <p className="card-subtitle">Update fields used by the AI Recommendation Engine</p>

          {message && <div className="success-banner">{message}</div>}
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / University</label>
              <input
                type="text"
                name="college"
                className="form-input"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Discipline</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select name="year" className="form-select" value={formData.year} onChange={handleChange}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mentoring Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                step="0.5"
                min="0"
                max="10"
                className="form-input"
                value={formData.experience_years}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mentoring Availability</label>
              <select name="availability" className="form-select" value={formData.availability} onChange={handleChange}>
                <option value="Flexible">Flexible (Anytime)</option>
                <option value="Weekdays Evenings">Weekdays Evenings</option>
                <option value="Weekends">Weekends</option>
                <option value="Weekdays Mornings">Weekdays Mornings</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Teaching Philosophy</label>
              <textarea
                name="bio"
                className="form-textarea"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .card-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .profile-badge-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .user-avatar-lg {
          width: 64px;
          height: 64px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(99, 102, 241, 0.4);
        }
        .info-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .info-lbl {
          color: var(--text-muted);
        }
        .info-val {
          font-weight: 600;
        }
        .skills-summary-box {
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem;
          border-radius: 10px;
        }
        .skills-tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .success-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Profile;
