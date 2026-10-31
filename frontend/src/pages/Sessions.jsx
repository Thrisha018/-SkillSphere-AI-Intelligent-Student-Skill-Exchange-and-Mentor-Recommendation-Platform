import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Clock, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';

const Sessions = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('learner'); // 'learner' or 'mentor'
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const [lRes, mRes] = await Promise.all([
        api.get('/sessions/my-requests').catch(() => ({ data: [] })),
        api.get('/sessions/mentor-requests').catch(() => ({ data: [] }))
      ]);
      setLearnerRequests(lRes.data || []);
      setMentorRequests(mRes.data || []);
    } catch (err) {
      setError('Failed to load session requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      await api.put(`/sessions/${sessionId}/status`, { status: newStatus });
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update request status.');
    }
  };

  const currentList = activeTab === 'learner' ? learnerRequests : mentorRequests;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><Users size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Mentoring Sessions & Requests</h1>
        <p className="page-subtitle">Track session lifecycle: Pending → Accepted → Completed → Feedback</p>
      </div>

      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab('learner')}
          className={`tab-btn ${activeTab === 'learner' ? 'active' : ''}`}
        >
          My Sent Requests (Learner) [{learnerRequests.length}]
        </button>
        <button
          onClick={() => setActiveTab('mentor')}
          className={`tab-btn ${activeTab === 'mentor' ? 'active' : ''}`}
        >
          Requests Received (Mentor) [{mentorRequests.length}]
        </button>
      </div>

      {loading ? (
        <div className="glass-card loading-box">Loading mentoring sessions...</div>
      ) : currentList.length > 0 ? (
        <div className="sessions-grid">
          {currentList.map((session) => (
            <div key={session.id} className="glass-card session-card">
              <div className="session-card-header">
                <div>
                  <h3 className="session-title">{session.skill_topic}</h3>
                  <p className="session-sub">
                    {activeTab === 'learner' ? (
                      <>Mentor: <strong>{session.mentor_name}</strong> ({session.mentor_email})</>
                    ) : (
                      <>Learner: <strong>{session.learner_name}</strong> ({session.learner_email})</>
                    )}
                  </p>
                </div>
                <span className={`badge ${
                  session.status === 'Completed' ? 'badge-emerald' :
                  session.status === 'Accepted' ? 'badge-cyan' :
                  session.status === 'Rejected' ? 'badge-amber' : 'badge-primary'
                }`}>
                  {session.status}
                </span>
              </div>

              <div className="session-body">
                <div className="message-box">
                  <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  "{session.message}"
                </div>

                <div className="session-meta-info">
                  <span><Clock size={14} style={{ verticalAlign: 'middle' }} /> Proposed Time: <strong>{session.proposed_time}</strong></span>
                  <span>Requested On: {new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Controls based on status and user role */}
              <div className="session-actions">
                {activeTab === 'mentor' && session.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'Accepted')}
                      className="btn-primary btn-sm"
                    >
                      <CheckCircle size={14} /> Accept Request
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'Rejected')}
                      className="btn-secondary btn-sm"
                    >
                      <XCircle size={14} /> Decline
                    </button>
                  </>
                )}

                {session.status === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(session.id, 'Completed')}
                    className="btn-primary btn-sm"
                    style={{ background: 'var(--gradient-emerald)' }}
                  >
                    <CheckCircle size={14} /> Mark Session Completed
                  </button>
                )}

                {activeTab === 'learner' && session.status === 'Completed' && (
                  <button
                    onClick={() => navigate(`/feedback?session_id=${session.id}&mentor_id=${session.mentor_id}&mentor_name=${encodeURIComponent(session.mentor_name)}`)}
                    className="btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
                  >
                    <Star size={14} /> Submit Rating & Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card empty-sessions">
          <Users size={40} color="#818cf8" style={{ marginBottom: '0.75rem' }} />
          <h3>No {activeTab === 'learner' ? 'sent' : 'received'} mentoring requests found.</h3>
          <p>
            {activeTab === 'learner' 
              ? 'Request a mentor from AI Recommendations to get started!' 
              : 'Students can send you requests when your skills match their learning goals.'}
          </p>
        </div>
      )}

      <style>{`
        .tab-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .tab-btn {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
          color: #fff;
        }
        .sessions-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .session-card {
          padding: 1.5rem;
        }
        .session-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .session-title {
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }
        .session-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .message-box {
          background: rgba(15, 23, 42, 0.6);
          border-left: 3px solid var(--primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          color: var(--text-main);
          margin-bottom: 0.75rem;
        }
        .session-meta-info {
          display: flex;
          gap: 1.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .session-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1rem;
        }
        .loading-box, .empty-sessions {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Sessions;
