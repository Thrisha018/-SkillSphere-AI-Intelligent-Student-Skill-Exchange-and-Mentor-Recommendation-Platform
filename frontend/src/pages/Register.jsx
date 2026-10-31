import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: 'IIT Bombay',
    department: 'Computer Science',
    year: '3rd Year',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card glass-card">
        <div className="register-header">
          <div className="logo-badge">
            <Sparkles size={24} color="#fff" />
          </div>
          <h2>Join <span className="text-gradient">SkillSphere AI</span></h2>
          <p>Create your student peer mentoring profile</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="aarav@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">College / University</label>
              <input
                type="text"
                name="college"
                className="form-input"
                placeholder="IIT Bombay"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department / Major</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="Computer Science"
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
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio / Interests</label>
            <textarea
              name="bio"
              className="form-textarea"
              placeholder="Tell us about your learning goals and skills..."
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : <><span>Create Student Account</span> <UserPlus size={18} /></>}
          </button>
        </form>

        <div className="register-footer">
          <p>Already registered? <Link to="/login" className="text-gradient">Login to your account</Link></p>
        </div>
      </div>

      <style>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .register-card {
          max-width: 650px;
          width: 100%;
          padding: 2.5rem;
        }
        .register-header {
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
        .register-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .register-header p {
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
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .register-btn {
          width: 100%;
          justify-content: center;
          padding: 0.85rem;
          margin-top: 0.5rem;
        }
        .register-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .register-footer a {
          font-weight: 600;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
