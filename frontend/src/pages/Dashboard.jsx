import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Award 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [recRes, reqRes, progRes] = await Promise.all([
          api.get('/recommendations/mentors').catch(() => ({ data: { recommendations: [] } })),
          api.get('/sessions/my-requests').catch(() => ({ data: [] })),
          api.get('/progress').catch(() => ({ data: null }))
        ]);
        setRecommendations(recRes.data.recommendations || []);
        setRequests(reqRes.data || []);
        setProgressData(progRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const completedSessionsCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="page-container">
      <div className="dashboard-hero glass-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> PEER-TO-PEER SKILL EXCHANGE
          </div>
          <h1 className="hero-title">Welcome back, <span className="text-gradient">{user?.name}</span></h1>
          <p className="hero-subtitle">
            {user?.college} • {user?.department} ({user?.year})
          </p>
          <div className="hero-skills">
            <span className="skill-label">Skills You Want to Learn:</span>
            {user?.learn_skills?.length > 0 ? (
              user.learn_skills.map(s => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))
            ) : (
              <span className="badge badge-amber">No learning skills added yet</span>
            )}
          </div>
        </div>

        <div className="hero-actions">
          <Link to="/recommendations" className="btn-primary">
            <Sparkles size={18} /> Find AI Recommended Mentors
          </Link>
          <Link to="/skills" className="btn-secondary">
            <BookOpen size={18} /> Manage My Skills
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon bg-indigo">
            <BookOpen size={24} color="#818cf8" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{user?.learn_skills?.length || 0}</span>
            <span className="stat-label">Skills Learning</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon bg-emerald">
            <Sparkles size={24} color="#34d399" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{recommendations.length}</span>
            <span className="stat-label">AI Recommended Mentors</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon bg-amber">
            <Users size={24} color="#fbbf24" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Mentoring Interactions</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon bg-pink">
            <Award size={24} color="#f472b6" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completedSessionsCount}</span>
            <span className="stat-label">Completed Sessions</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Top Mentor Matches */}
        <div className="glass-card section-card">
          <div className="section-header">
            <div>
              <h3><Sparkles size={20} color="#818cf8" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Top AI Mentor Recommendations</h3>
              <p className="section-desc">Matched using Scikit-Learn TF-IDF Cosine Similarity & Multi-Factor Weights</p>
            </div>
            <Link to="/recommendations" className="btn-secondary btn-sm">
              View All ({recommendations.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">Analyzing mentor profiles...</div>
          ) : recommendations.length > 0 ? (
            <div className="top-mentors-list">
              {recommendations.slice(0, 3).map(mentor => (
                <div key={mentor.mentor_id} className="mentor-preview-card">
                  <div className="mentor-card-top">
                    <div>
                      <h4 className="mentor-name">{mentor.name}</h4>
                      <span className="mentor-meta">{mentor.college} • {mentor.department}</span>
                    </div>
                    <div className="compat-badge">
                      <span className="compat-score">{mentor.compatibility_score}%</span>
                      <span className="compat-lbl">Match</span>
                    </div>
                  </div>

                  <div className="mentor-skills-preview">
                    {mentor.teach_skills.map(skill => (
                      <span 
                        key={skill} 
                        className={`badge ${mentor.matching_skills.includes(skill) ? 'badge-emerald' : 'badge-primary'}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mentor-explanation">
                    <small>{mentor.explanation}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Add skills you want to learn in Skill Management to view AI recommendations!</p>
              <Link to="/skills" className="btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Add Skills Now</Link>
            </div>
          )}
        </div>

        {/* Mentoring Requests Status */}
        <div className="glass-card section-card">
          <div className="section-header">
            <div>
              <h3><Users size={20} color="#fbbf24" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Mentoring Requests</h3>
              <p className="section-desc">Track status of your sent and received requests</p>
            </div>
            <Link to="/sessions" className="btn-secondary btn-sm">
              View Lifecycle <ArrowRight size={14} />
            </Link>
          </div>

          {requests.length > 0 ? (
            <div className="requests-preview-list">
              {requests.slice(0, 4).map(req => (
                <div key={req.id} className="request-preview-item">
                  <div className="req-header">
                    <span className="req-mentor">Mentor: <strong>{req.mentor_name}</strong></span>
                    <span className={`badge ${
                      req.status === 'Completed' ? 'badge-emerald' :
                      req.status === 'Accepted' ? 'badge-cyan' :
                      req.status === 'Rejected' ? 'badge-amber' : 'badge-primary'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="req-topic">Topic: {req.skill_topic}</div>
                  <small className="req-time">Time: {req.proposed_time}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No active mentoring requests yet.</p>
              <Link to="/recommendations" className="btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>Request a Mentor</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-hero {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(30, 41, 65, 0.9), rgba(15, 23, 42, 0.9));
          border-left: 4px solid var(--primary);
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #818cf8;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .hero-title {
          font-size: 2.2rem;
          margin-bottom: 0.35rem;
        }
        .hero-subtitle {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .hero-skills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .skill-label {
          font-size: 0.85rem;
          color: var(--text-dim);
          font-weight: 600;
        }
        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .stats-grid {
          margin-bottom: 2rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-indigo { background: rgba(99, 102, 241, 0.15); }
        .bg-emerald { background: rgba(16, 185, 129, 0.15); }
        .bg-amber { background: rgba(245, 158, 11, 0.15); }
        .bg-pink { background: rgba(244, 114, 182, 0.15); }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-heading);
        }
        .stat-label {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.5rem;
        }
        .section-card {
          padding: 1.75rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .section-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .top-mentors-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mentor-preview-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 1.2rem;
          transition: all 0.2s ease;
        }
        .mentor-preview-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
        }
        .mentor-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .mentor-name {
          font-size: 1.1rem;
        }
        .mentor-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .compat-badge {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .compat-score {
          font-size: 1.1rem;
          font-weight: 800;
          color: #34d399;
          font-family: var(--font-heading);
          line-height: 1;
        }
        .compat-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .mentor-skills-preview {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-bottom: 0.6rem;
        }
        .mentor-explanation {
          color: var(--text-muted);
          font-size: 0.82rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.5rem;
        }
        .requests-preview-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .request-preview-item {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 1rem;
        }
        .req-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
        }
        .req-topic {
          font-size: 0.85rem;
          color: var(--text-main);
        }
        .req-time {
          color: var(--text-muted);
          font-size: 0.78rem;
        }
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .loading-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-hero { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
