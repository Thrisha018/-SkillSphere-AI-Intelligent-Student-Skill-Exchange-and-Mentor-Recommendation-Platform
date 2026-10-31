import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, Plus, Trash2, CheckCircle, Sparkles } from 'lucide-react';

const POPULAR_SKILLS = [
  "Python", "Machine Learning", "FastAPI", "MongoDB", "React.js", 
  "JavaScript", "Data Structures", "SQL", "Scikit-Learn", "C++", 
  "Web Development", "Data Science", "Node.js", "Deep Learning", "Public Speaking"
];

const Skills = () => {
  const { user, setUser } = useAuth();
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    if (!teachSkill.trim()) return;
    setMessage('');
    setError('');
    try {
      const res = await api.post('/skills/teach', { skill_name: teachSkill });
      updateUserSkills(res.data.teach_skills, res.data.learn_skills);
      setTeachSkill('');
      setMessage(`Added '${teachSkill}' to skills you teach!`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add skill.');
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!learnSkill.trim()) return;
    setMessage('');
    setError('');
    try {
      const res = await api.post('/skills/learn', { skill_name: learnSkill });
      updateUserSkills(res.data.teach_skills, res.data.learn_skills);
      setLearnSkill('');
      setMessage(`Added '${learnSkill}' to skills you want to learn!`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add skill.');
    }
  };

  const handleRemoveTeachSkill = async (skillName) => {
    try {
      const res = await api.delete(`/skills/teach/${encodeURIComponent(skillName)}`);
      updateUserSkills(res.data.teach_skills, res.data.learn_skills);
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  const handleRemoveLearnSkill = async (skillName) => {
    try {
      const res = await api.delete(`/skills/learn/${encodeURIComponent(skillName)}`);
      updateUserSkills(res.data.teach_skills, res.data.learn_skills);
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  const updateUserSkills = (teach, learn) => {
    const updatedUser = { ...user, teach_skills: teach, learn_skills: learn };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><BookOpen size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Skill Management</h1>
        <p className="page-subtitle">Add and manage skills you can teach to peers and skills you want to learn</p>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        {/* Teach Skills Box */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3>Skills You Can Teach</h3>
              <p className="card-subtitle">Peer students can request mentoring for these subjects</p>
            </div>
            <span className="badge badge-emerald">{user?.teach_skills?.length || 0} Teaching</span>
          </div>

          <form onSubmit={handleAddTeachSkill} className="skill-input-form">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. C++, HTML, Public Speaking..."
              value={teachSkill}
              onChange={(e) => setTeachSkill(e.target.value)}
            />
            <button type="submit" className="btn-primary btn-sm">
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="skills-list">
            {user?.teach_skills?.length > 0 ? (
              user.teach_skills.map(s => (
                <div key={s} className="skill-item-pill glass-card">
                  <span className="skill-name">{s}</span>
                  <button 
                    onClick={() => handleRemoveTeachSkill(s)} 
                    className="delete-skill-btn"
                    title="Remove skill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-skills">No teaching skills added yet. Add skills you can share!</div>
            )}
          </div>
        </div>

        {/* Learn Skills Box */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3>Skills You Want to Learn</h3>
              <p className="card-subtitle">Used by AI Recommendation Engine to match suitable mentors</p>
            </div>
            <span className="badge badge-primary">{user?.learn_skills?.length || 0} Learning</span>
          </div>

          <form onSubmit={handleAddLearnSkill} className="skill-input-form">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, Machine Learning, SQL..."
              value={learnSkill}
              onChange={(e) => setLearnSkill(e.target.value)}
            />
            <button type="submit" className="btn-primary btn-sm">
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="skills-list">
            {user?.learn_skills?.length > 0 ? (
              user.learn_skills.map(s => (
                <div key={s} className="skill-item-pill glass-card">
                  <span className="skill-name">{s}</span>
                  <button 
                    onClick={() => handleRemoveLearnSkill(s)} 
                    className="delete-skill-btn"
                    title="Remove skill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-skills">No learning skills added yet. Add skills to get AI mentor matches!</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Popular Skills Section */}
      <div className="glass-card popular-skills-section" style={{ marginTop: '2rem' }}>
        <h3><Sparkles size={18} color="#818cf8" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Quick Add Popular Skills</h3>
        <p className="card-subtitle">Click to add directly to your learning goals list</p>

        <div className="quick-skills-tags">
          {POPULAR_SKILLS.map(skill => {
            const isAdded = user?.learn_skills?.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (!isAdded) {
                    setLearnSkill(skill);
                  }
                }}
                className={`quick-skill-btn ${isAdded ? 'added' : ''}`}
                disabled={isAdded}
              >
                {skill} {isAdded ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }
        .skill-input-form {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .skill-item-pill {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.6);
        }
        .skill-name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .delete-skill-btn {
          background: transparent;
          border: none;
          color: #f87171;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .delete-skill-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .empty-skills {
          text-align: center;
          padding: 2rem;
          color: var(--text-dim);
          font-size: 0.88rem;
        }
        .quick-skills-tags {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .quick-skill-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-main);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-skill-btn:hover:not(:disabled) {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }
        .quick-skill-btn.added {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
          cursor: default;
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

export default Skills;
