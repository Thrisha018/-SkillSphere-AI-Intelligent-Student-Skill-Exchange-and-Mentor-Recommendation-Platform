import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TrendingUp, CheckCircle2, Clock, Edit3, Save, Award } from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Editing state
  const [editingSkill, setEditingSkill] = useState(null);
  const [editStatus, setEditStatus] = useState('In Progress');
  const [editPercent, setEditPercent] = useState(50);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress');
      setProgressData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (record) => {
    setEditingSkill(record.skill_name);
    setEditStatus(record.status || 'In Progress');
    setEditPercent(record.completion_percentage || 50);
    setEditNotes(record.notes || '');
    setMessage('');
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/progress/update', {
        skill_name: editingSkill,
        status: editStatus,
        completion_percentage: parseFloat(editPercent),
        notes: editNotes
      });
      setMessage(`Progress for '${editingSkill}' saved!`);
      setEditingSkill(null);
      fetchProgress();
    } catch (err) {
      alert('Failed to update progress.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><TrendingUp size={28} color="#34d399" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Learning Progress Tracking</h1>
        <p className="page-subtitle">Track learning outcomes, skill completion percentage, and completed peer mentoring sessions</p>
      </div>

      {message && <div className="success-banner">{message}</div>}

      {/* Progress Overview Hero Cards */}
      <div className="grid-3 overview-cards" style={{ marginBottom: '2rem' }}>
        <div className="glass-card stat-box">
          <span className="stat-num text-gradient">{progressData?.learn_skills_count || 0}</span>
          <span className="stat-desc">Target Skills Learning</span>
        </div>

        <div className="glass-card stat-box">
          <span className="stat-num" style={{ color: '#34d399' }}>{progressData?.completed_sessions_count || 0}</span>
          <span className="stat-desc">Completed Mentoring Sessions</span>
        </div>

        <div className="glass-card stat-box">
          <span className="stat-num" style={{ color: '#22d3ee' }}>
            {progressData?.progress_records ? (
              Math.round(progressData.progress_records.reduce((acc, curr) => acc + curr.completion_percentage, 0) / (progressData.progress_records.length || 1))
            ) : 0}%
          </span>
          <span className="stat-desc">Average Overall Completion</span>
        </div>
      </div>

      {/* Skill Progress Records */}
      <div className="glass-card">
        <h3>Skill Mastery & Outcomes</h3>
        <p className="card-subtitle">Update completion percentage and session notes</p>

        {loading ? (
          <div className="loading-box">Loading learning progress...</div>
        ) : progressData?.progress_records?.length > 0 ? (
          <div className="progress-records-list">
            {progressData.progress_records.map((record) => (
              <div key={record.skill_name} className="progress-record-card glass-card">
                <div className="record-header">
                  <div>
                    <h4 className="skill-title">{record.skill_name}</h4>
                    <span className={`badge ${record.status === 'Completed' ? 'badge-emerald' : 'badge-primary'}`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="percentage-display">
                    <span>{record.completion_percentage}%</span>
                    <button
                      onClick={() => handleStartEditing(record)}
                      className="btn-secondary btn-sm"
                    >
                      <Edit3 size={14} /> Update
                    </button>
                  </div>
                </div>

                <div className="progress-bar-bg" style={{ margin: '0.75rem 0' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${record.completion_percentage}%`,
                      background: record.completion_percentage >= 100 ? 'var(--gradient-emerald)' : 'var(--gradient-brand)'
                    }} 
                  />
                </div>

                <div className="record-notes">
                  <small><strong>Learning Notes:</strong> {record.notes || 'No notes added yet.'}</small>
                </div>

                {/* Inline Editing Form */}
                {editingSkill === record.skill_name && (
                  <form onSubmit={handleSaveProgress} className="edit-progress-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Completion ({editPercent}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="slider-input"
                          value={editPercent}
                          onChange={(e) => setEditPercent(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Update Notes</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mastered basic syntax with mentor Ananya..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="button" onClick={() => setEditingSkill(null)} className="btn-secondary btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Updates'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No learning skills added to track. Go to Skill Management to add target skills!</p>
          </div>
        )}
      </div>

      <style>{`
        .overview-cards .stat-box {
          padding: 1.5rem;
          text-align: center;
        }
        .stat-num {
          font-size: 2.5rem;
          font-weight: 800;
          font-family: var(--font-heading);
          display: block;
          line-height: 1.1;
        }
        .stat-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .progress-records-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .progress-record-card {
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.6);
        }
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .skill-title {
          font-size: 1.15rem;
          margin-bottom: 0.25rem;
        }
        .percentage-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.4rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-main);
        }
        .record-notes {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .edit-progress-form {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-glass);
          background: rgba(15, 23, 42, 0.9);
          padding: 1rem;
          border-radius: 10px;
        }
        .slider-input {
          width: 100%;
          accent-color: var(--primary);
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .success-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Progress;
