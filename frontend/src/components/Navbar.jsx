import React, { useState } from 'react';
import { 
  Activity, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  LayoutDashboard,
  Home
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  currentView, 
  setCurrentView 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setCurrentView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Top Project Notice Ribbon */}
      <div className="phase-banner">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge">Phase 2 Backend & Auth</span>
          <span>Amazon Cognito User Pools • Amazon DynamoDB • AWS Lambda Microservices Architecture</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <a 
              href="#" 
              className="brand-logo" 
              onClick={(e) => { 
                e.preventDefault(); 
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
            >
              <div className="brand-icon">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <div>
                Cloud<span style={{ color: 'var(--primary)' }}>Care</span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <ul className="nav-links">
              <li>
                <a 
                  href="#" 
                  className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Home size={16} />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="#specialties" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('specialties'); }}>
                  Specialties
                </a>
              </li>
              <li>
                <a href="#doctors" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('doctors'); }}>
                  Doctors
                </a>
              </li>
              <li>
                <a href="#aws-architecture" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('aws-architecture'); }}>
                  AWS Stack
                </a>
              </li>

              {/* Protected Dashboard Link if logged in */}
              {user && (
                <li>
                  <a 
                    href="#dashboard" 
                    className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}
                    style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <LayoutDashboard size={16} />
                    <span>My Dashboard</span>
                  </a>
                </li>
              )}
            </ul>

            {/* Actions: Auth Status & Controls */}
            <div className="nav-actions">
              {user ? (
                /* Authenticated User Info & Logout */
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: user.role === 'Admin' ? 'var(--accent-purple-light)' : user.role === 'Doctor' ? 'var(--secondary-light)' : 'var(--primary-light)',
                      color: user.role === 'Admin' ? 'var(--accent-purple)' : user.role === 'Doctor' ? 'var(--secondary)' : 'var(--primary)'
                    }}>
                      {user.role}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark-800)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  </div>

                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="btn btn-outline btn-sm"
                    title="Open Dashboard"
                  >
                    <LayoutDashboard size={15} />
                    <span>Dashboard</span>
                  </button>

                  <button 
                    onClick={onLogout}
                    className="btn btn-outline btn-sm"
                    title="Sign Out"
                    style={{ color: '#e11d48' }}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                /* Unauthenticated: Sign In CTA */
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={onOpenAuth}
                    className="btn btn-outline"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>

                  <button 
                    onClick={() => scrollToSection('doctors')}
                    className="btn btn-primary"
                  >
                    Book Appointment
                  </button>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button 
                className="mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div style={{ padding: '16px 0', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setCurrentView('home'); setMobileMenuOpen(false); }}>Home</a>
              <a href="#specialties" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('specialties'); }}>Specialties</a>
              <a href="#doctors" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('doctors'); }}>Doctors</a>
              {user ? (
                <>
                  <a href="#dashboard" className="nav-link" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); setMobileMenuOpen(false); }}>
                    My Dashboard ({user.role})
                  </a>
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn btn-outline btn-sm" style={{ color: '#e11d48' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="btn btn-primary btn-sm">
                  Sign In / Register
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
