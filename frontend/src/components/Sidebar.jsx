import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Sparkles, 
  Users, 
  Star, 
  TrendingUp 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Skill Management', path: '/skills', icon: BookOpen },
    { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles, highlight: true },
    { label: 'Mentoring Sessions', path: '/sessions', icon: Users },
    { label: 'Rating & Feedback', path: '/feedback', icon: Star },
    { label: 'Progress Tracking', path: '/progress', icon: TrendingUp },
  ];

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-item' : ''}`
              }
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .sidebar-container {
          width: 250px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          border-right: 1px solid var(--border-glass);
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 70px);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.8rem 1rem;
          color: var(--text-muted);
          text-decoration: none;
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.92rem;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-item.active {
          color: #fff;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
        }
        .nav-item.active .nav-icon {
          color: #818cf8;
        }
        .highlight-item {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15));
          border: 1px dashed rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
