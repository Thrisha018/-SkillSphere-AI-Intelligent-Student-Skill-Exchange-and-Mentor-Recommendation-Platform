import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, 
  Award, 
  Clock, 
  Send, 
  CheckCircle, 
  Info, 
  Sliders, 
  X, 
  Star, 
  BookOpen 
} from 'lucide-react';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestTopic, setRequestTopic] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('Weekdays Evenings');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/recommendations/mentors');
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate mentor recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestTopic(mentor.matching_skills[0] || mentor.teach_skills[0] || 'General Mentoring');
    setRequestMessage(`Hi ${mentor.name}! I saw your profile on SkillSphere AI and would love guidance on ${mentor.matching_skills.join(', ') || 'mentoring'}.`);
    setProposedTime(user?.availability || 'Weekdays Evenings');
    setSuccessMessage('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setSending(true);
    try {
      await api.post('/sessions/request', {
        mentor_id: selectedMentor.mentor_id,
        skill_topic: requestTopic,
        message: requestMessage,
        proposed_time: proposedTime
      });
      setSuccessMessage(`Mentoring request sent successfully to ${selectedMentor.name}!`);
      setTimeout(() => {
        setSelectedMentor(null);
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send mentoring request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><Sparkles size={28} color="#818cf8" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> AI Mentor Recommendations</h1>
        <p className="page-subtitle">Intelligent Content-Based & Weighted Recommendation Engine powered by Scikit-Learn TF-IDF Cosine Similarity</p>
      </div>

      {/* Algorithm Transparency Banner */}
      <div className="glass-card algo-banner">
        <div className="algo-banner-header">
          <Info size={20} color="#818cf8" />
          <h3>Recommendation Methodology & Scoring Model</h3>
        </div>
        <p className="algo-desc">
          Calculates multi-factor compatibility scores using: 
          <strong> Skill Compatibility (40%)</strong> via Scikit-Learn TF-IDF Cosine Similarity + Exact Overlap, 
          <strong> Mentor Rating (20%)</strong> with Bayesian prior smoothing, 
          <strong> Mentoring Experience (20%)</strong>, 
          <strong> Schedule Availability (10%)</strong>, and 
          <strong> Historical Feedback Sentiment (10%)</strong>.
        </p>

        <div className="learner-req-summary">
          <span>Learner Requirements:</span>
          {user?.learn_skills?.length > 0 ? (
            user.learn_skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)
          ) : (
            <span className="badge badge-amber">No learning skills specified in profile</span>
          )}
          <span className="availability-tag">Availability: <strong>{user?.availability || 'Flexible'}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="glass-card loading-box">
          <Sparkles className="spin-icon" size={32} color="#818cf8" />
          <p>Running AI Mentor Matching Engine across candidate database...</p>
        </div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-list">
          {recommendations.map((mentor, index) => (
            <div key={mentor.mentor_id} className="glass-card mentor-recommend-card">
              <div className="rank-badge">RANK #{index + 1}</div>

              <div className="mentor-card-header">
                <div className="mentor-main-info">
                  <div className="mentor-avatar-box">
                    {mentor.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="mentor-name-title">{mentor.name}</h2>
                    <p className="mentor-sub">{mentor.college} • {mentor.department} ({mentor.year})</p>
                    <div className="mentor-badges">
                      <span className="badge badge-amber"><Star size={12} /> {mentor.rating}★ ({mentor.total_ratings} ratings)</span>
                      <span className="badge badge-cyan"><Clock size={12} /> {mentor.experience_years} Yrs Exp</span>
                      <span className="badge badge-primary">{mentor.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="score-summary-box">
                  <div className="compat-percentage">{mentor.compatibility_score}%</div>
                  <div className="compat-label">COMPATIBILITY SCORE</div>
                </div>
              </div>

              {/* Explainable Reasoning */}
              <div className="explanation-box">
                <strong>AI Match Rationale:</strong> {mentor.explanation}
              </div>

              {/* Taught Skills & Matching Highlights */}
              <div className="mentor-skills-section">
                <span className="section-label">Skills Mentor Teaches:</span>
                <div className="skills-row">
                  {mentor.teach_skills.map(s => {
                    const isMatch = mentor.matching_skills.includes(s);
                    return (
                      <span key={s} className={`badge ${isMatch ? 'badge-emerald' : 'badge-primary'}`}>
                        {isMatch && '✓ '} {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Factor Score Breakdown Progress Bars */}
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-lbl">
                    <span>Skill Compatibility (40%)</span>
                    <span>{mentor.score_breakdown.skill_compatibility}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${mentor.score_breakdown.skill_compatibility}%` }} />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl">
                    <span>Rating Score (20%)</span>
                    <span>{mentor.score_breakdown.rating_score}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${mentor.score_breakdown.rating_score}%`, background: 'var(--gradient-emerald)' }} />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl">
                    <span>Experience Score (20%)</span>
                    <span>{mentor.score_breakdown.experience_score}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${mentor.score_breakdown.experience_score}%`, background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }} />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-lbl">
                    <span>Availability & Feedback (20%)</span>
                    <span>{mentor.score_breakdown.availability_score}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${mentor.score_breakdown.availability_score}%`, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }} />
                  </div>
                </div>
              </div>

              <div className="card-action-row">
                <button onClick={() => handleOpenRequestModal(mentor)} className="btn-primary">
                  <Send size={16} /> Request Mentoring Session
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card empty-recs">
          <BookOpen size={48} color="#818cf8" style={{ marginBottom: '1rem' }} />
          <h3>No Compatible Mentors Found</h3>
          <p>Try adding more learning skills in your profile to trigger the AI recommendation engine!</p>
        </div>
      )}

      {/* Mentoring Request Modal */}
      {selectedMentor && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <div>
                <h3>Request Mentoring from <span className="text-gradient">{selectedMentor.name}</span></h3>
                <p className="modal-sub">Compatibility: {selectedMentor.compatibility_score}%</p>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>

            {successMessage ? (
              <div className="success-banner" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle size={32} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                <h4>{successMessage}</h4>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="request-form">
                <div className="form-group">
                  <label className="form-label">Mentoring Topic / Skill</label>
                  <input
                    type="text"
                    className="form-input"
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Session Time</label>
                  <select
                    className="form-select"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  >
                    <option value="Weekdays Evenings">Weekdays Evenings</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Weekdays Mornings">Weekdays Mornings</option>
                    <option value="Flexible">Flexible / Discuss via Chat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Introductory Message to Mentor</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setSelectedMentor(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .algo-banner {
          margin-bottom: 2rem;
          background: linear-gradient(135deg, rgba(30, 41, 65, 0.8), rgba(15, 23, 42, 0.9));
          border-left: 4px solid var(--primary);
        }
        .algo-banner-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .algo-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .learner-req-summary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          background: rgba(15, 23, 42, 0.6);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
        }
        .availability-tag {
          margin-left: auto;
          color: var(--text-muted);
        }
        .loading-box {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
        .spin-icon {
          animation: spin 2s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .mentor-recommend-card {
          position: relative;
          padding: 2rem;
        }
        .rank-badge {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.4);
        }
        .mentor-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }
        .mentor-main-info {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
        }
        .mentor-avatar-box {
          width: 56px;
          height: 56px;
          background: var(--gradient-brand);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          color: #fff;
          font-family: var(--font-heading);
          box-shadow: 0 4px 15px var(--primary-glow);
        }
        .mentor-name-title {
          font-size: 1.35rem;
          margin-bottom: 0.2rem;
        }
        .mentor-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .mentor-badges {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .score-summary-box {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          text-align: center;
        }
        .compat-percentage {
          font-size: 2rem;
          font-weight: 800;
          color: #34d399;
          font-family: var(--font-heading);
          line-height: 1;
        }
        .compat-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-top: 0.2rem;
        }
        .explanation-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .section-label {
          font-size: 0.82rem;
          color: var(--text-dim);
          font-weight: 600;
          display: block;
          margin-bottom: 0.4rem;
        }
        .skills-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          background: rgba(15, 23, 42, 0.4);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.25rem;
        }
        .breakdown-lbl {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
        }
        .card-action-row {
          display: flex;
          justify-content: flex-end;
        }
        .empty-recs {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
        }
        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          max-width: 540px;
          width: 100%;
          padding: 2rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .modal-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .close-modal-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
