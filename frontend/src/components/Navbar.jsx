import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <div className="logo-icon">
          <Sparkles size={20} color="#fff" />
        </div>
        <span className="brand-title text-gradient">SkillSphere AI</span>
        <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>PEER MENTORING</span>
      </div>

      {user && (
        <div className="navbar-user-area">
          <div className="user-pill glass-card" style={{ padding: '0.4rem 0.9rem', borderRadius: '30px' }}>
            <div className="avatar-circle">
              <User size={16} color="#818cf8" />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-college">{user.college || 'Student'}</span>
            </div>
            {user.rating && (
              <span className="badge badge-amber" style={{ marginLeft: '0.5rem' }}>
                <Award size={12} /> {user.rating}★
              </span>
            )}
          </div>

          <button onClick={logout} className="btn-secondary btn-sm" title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      <style>{`
        .navbar-container {
          height: 70px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--gradient-brand);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px var(--primary-glow);
        }
        .brand-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
        }
        .navbar-user-area {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .avatar-circle {
          width: 30px;
          height: 30px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .user-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .user-college {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
