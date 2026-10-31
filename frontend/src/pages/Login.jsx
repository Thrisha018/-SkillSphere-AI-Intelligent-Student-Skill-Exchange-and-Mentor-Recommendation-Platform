import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogIn, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-badge">
            <Sparkles size={24} color="#fff" />
          </div>
          <h2>Welcome to <span className="text-gradient">SkillSphere AI</span></h2>
          <p>Intelligent Student Skill Exchange & Mentor Recommendation Platform</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. rohan@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : <><span>Login</span> <LogIn size={18} /></>}
          </button>
        </form>

        <div className="demo-section">
          <div className="demo-divider">
            <span>QUICK DEMO LOGINS FOR PRESENTATION</span>
          </div>
          <div className="demo-buttons">
            <button
              onClick={() => handleDemoLogin('rohan@college.edu')}
              className="btn-secondary demo-btn"
              type="button"
            >
              <CheckCircle2 size={16} color="#818cf8" />
              <span>Rohan Verma (Learner)</span>
            </button>

            <button
              onClick={() => handleDemoLogin('ananya@college.edu')}
              className="btn-secondary demo-btn"
              type="button"
            >
              <ShieldCheck size={16} color="#34d399" />
              <span>Ananya Sharma (Mentor)</span>
            </button>

            <button
              onClick={() => handleDemoLogin('vikram@college.edu')}
              className="btn-secondary demo-btn"
              type="button"
            >
              <CheckCircle2 size={16} color="#fbbf24" />
              <span>Vikramaditya (FullStack)</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="text-gradient">Register as a Student</Link></p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          max-width: 480px;
          width: 100%;
          padding: 2.5rem;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-badge {
          width: 48px;
          height: 48px;
          background: var(--gradient-brand);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 0 20px var(--primary-glow);
        }
        .login-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.88rem;
          margin-bottom: 1.25rem;
          text-align: center;
        }
        .login-btn {
          width: 100%;
          justify-content: center;
          padding: 0.85rem;
          margin-top: 0.5rem;
        }
        .demo-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
        }
        .demo-divider {
          text-align: center;
          margin-bottom: 1rem;
        }
        .demo-divider span {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }
        .demo-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .demo-btn {
          justify-content: flex-start;
          width: 100%;
          font-size: 0.88rem;
          padding: 0.6rem 1rem;
        }
        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .login-footer a {
          font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Login;
