import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react';

const Feedback = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSessionId = searchParams.get('session_id') || '';
  const initialMentorId = searchParams.get('mentor_id') || '';
  const initialMentorName = searchParams.get('mentor_name') || '';

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [mentorId, setMentorId] = useState(initialMentorId);
  const [mentorName, setMentorName] = useState(initialMentorName);
  const [rating, setRating] = useState(5.0);
  const [comment, setComment] = useState('');
  
  const [completedSessions, setCompletedSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      const res = await api.get('/sessions/my-requests');
      const finished = res.data.filter(s => s.status === 'Completed' || s.status === 'Accepted');
      setCompletedSessions(finished);
      if (finished.length > 0 && !initialSessionId) {
        setSessionId(finished[0].id);
        setMentorId(finished[0].mentor_id);
        setMentorName(finished[0].mentor_name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSession = (e) => {
    const selectedId = e.target.value;
    setSessionId(selectedId);
    const found = completedSessions.find(s => s.id === selectedId);
    if (found) {
      setMentorId(found.mentor_id);
      setMentorName(found.mentor_name);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!sessionId || !mentorId) {
      setError('Please select a valid completed session to rate.');
      return;
    }
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/feedback', {
        session_id: sessionId,
        mentor_id: mentorId,
        rating: parseFloat(rating),
        comment: comment
      });

      setMessage(`Feedback submitted! Updated ${mentorName || 'Mentor'}'s rating to ${res.data.updated_mentor_rating}★.`);
      setComment('');
      setTimeout(() => {
        navigate('/sessions');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWdith: '800px' }}>
      <div className="page-header">
        <h1 className="page-title"><Star size={28} color="#fbbf24" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Mentoring Rating & Feedback</h1>
        <p className="page-subtitle">Submit ratings & qualitative feedback to improve future peer mentor recommendations</p>
      </div>

      <div className="glass-card feedback-card">
        {message && (
          <div className="success-banner">
            <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {message}
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmitFeedback} className="feedback-form">
          {completedSessions.length > 0 ? (
            <div className="form-group">
              <label className="form-label">Select Completed Mentoring Session</label>
              <select className="form-select" value={sessionId} onChange={handleSelectSession}>
                {completedSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    Mentor: {s.mentor_name} — Topic: {s.skill_topic} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Mentor Name</label>
              <input type="text" className="form-input" value={mentorName || 'Mentor'} readOnly />
            </div>
          )}

          {/* Star Rating Selector */}
          <div className="form-group">
            <label className="form-label">Rating (1 to 5 Stars)</label>
            <div className="star-rating-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                >
                  <Star size={28} fill={star <= rating ? '#fbbf24' : 'transparent'} color="#fbbf24" />
                </button>
              ))}
              <span className="rating-value-label">{rating}.0 / 5.0 Stars</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Qualitative Feedback & Comments</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describe your learning outcome, clarity of explanation, and helpfulness of the mentor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="feedback-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Mentor Feedback'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .feedback-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 2.25rem;
        }
        .star-rating-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.6);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--border-glass);
        }
        .star-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .star-btn:hover {
          transform: scale(1.15);
        }
        .rating-value-label {
          margin-left: 1rem;
          font-weight: 700;
          color: #fbbf24;
          font-size: 1rem;
        }
        .feedback-form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .success-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default Feedback;
