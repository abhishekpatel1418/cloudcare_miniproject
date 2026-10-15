import React, { useState } from 'react';
import { Activity, Phone, ShieldCheck, UserCheck, Stethoscope, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar({ onSelectRolePortal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Project Notice Ribbon */}
      <div className="phase-banner">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge">Phase 1 Foundation</span>
          <span>CloudCare Hospital Appointment Booking System • Frontend & Doctor Discovery (AWS Serverless Architecture)</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
                <a href="#specialties" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('specialties'); }}>
                  Specialties
                </a>
              </li>
              <li>
                <a href="#doctors" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('doctors'); }}>
                  Find Doctors
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#roles" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('roles'); }}>
                  User Roles
                </a>
              </li>
              <li>
                <a href="#aws-architecture" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('aws-architecture'); }}>
                  Cloud Stack
                </a>
              </li>
            </ul>

            {/* Actions: Emergency Line & Role Portal Switcher */}
            <div className="nav-actions">
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  aria-expanded={portalDropdownOpen}
                >
                  <UserCheck size={16} />
                  <span>Portal Login</span>
                  <ChevronDown size={14} />
                </button>

                {portalDropdownOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--gray-200)',
                      minWidth: '220px',
                      padding: '8px',
                      zIndex: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onSelectRolePortal('Patient');
                      }}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--dark-800)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <UserCheck size={16} color="var(--primary)" />
                      <div>
                        <div>Patient Portal</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: 400 }}>Bookings & history</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onSelectRolePortal('Doctor');
                      }}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--dark-800)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Stethoscope size={16} color="var(--secondary)" />
                      <div>
                        <div>Doctor Portal</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: 400 }}>Schedules & consultations</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onSelectRolePortal('Admin');
                      }}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--dark-800)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ShieldCheck size={16} color="var(--accent-purple)" />
                      <div>
                        <div>Admin Portal</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: 400 }}>Hospital management</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => scrollToSection('doctors')}
              >
                Book Appointment
              </button>

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
              <a href="#specialties" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('specialties'); }}>Specialties</a>
              <a href="#doctors" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('doctors'); }}>Find Doctors</a>
              <a href="#how-it-works" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
              <a href="#roles" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('roles'); }}>User Roles</a>
              <a href="#aws-architecture" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('aws-architecture'); }}>AWS Architecture</a>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
