import React from 'react';
import { Search, Calendar, ShieldCheck, Clock, Users, Award, Sparkles, ArrowRight, Stethoscope } from 'lucide-react';
import { departmentsData } from '../data/departmentsData';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedDepartment, 
  setSelectedDepartment,
  onPerformSearch 
}) {
  const handleHeroSearch = (e) => {
    e.preventDefault();
    onPerformSearch();
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Headlines & Quick Search */}
          <div>
            <div className="hero-pill">
              <Sparkles size={16} />
              <span>Intelligent Hospital Resource Scheduling</span>
            </div>

            <h1 className="hero-title">
              Instant Doctor Appointments, <br />
              <span className="gradient-text">Zero Waiting Room Hassle.</span>
            </h1>

            <p className="hero-subtitle">
              CloudCare connects patients with trusted multi-specialty doctors. View verified credentials, 
              check live slot availability, and reserve appointments with instant cloud confirmations.
            </p>

            {/* Quick Search Form */}
            <div className="hero-search-box">
              <div className="hero-search-title">
                <Search size={16} color="var(--primary)" />
                <span>Quick Specialist Finder</span>
              </div>

              <form onSubmit={handleHeroSearch} className="search-inputs-grid">
                <div className="input-with-icon">
                  <Search size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Doctor name, condition, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="input-with-icon">
                  <Stethoscope size={18} className="input-icon" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="All">All Specialties</option>
                    {departmentsData.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
                  <span>Find Doctor</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Interactive Hospital Live Stats Card */}
          <div>
            <div className="hero-visual-card">
              <div className="status-indicator-live">
                <span className="pulsing-dot"></span>
                <span>CloudCare Central Hospital • OPD Live</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Award size={30} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                    Accredited Healthcare
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                    NABH & JCI Certified Clinical Standard
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: '1.5', marginBottom: '18px' }}>
                Over 8 specialized departments with dedicated intensive care and outpatient facilities running 
                on resilient AWS serverless microservices.
              </p>

              {/* Stats Grid */}
              <div className="hero-stats-row">
                <div className="stat-mini-card">
                  <div className="stat-mini-number">50+</div>
                  <div className="stat-mini-label">Verified Specialists</div>
                </div>
                <div className="stat-mini-card">
                  <div className="stat-mini-number" style={{ color: 'var(--secondary)' }}>15k+</div>
                  <div className="stat-mini-label">Patients Served</div>
                </div>
                <div className="stat-mini-card">
                  <div className="stat-mini-number" style={{ color: 'var(--accent-emerald)' }}>99.9%</div>
                  <div className="stat-mini-label">AWS System Uptime</div>
                </div>
                <div className="stat-mini-card">
                  <div className="stat-mini-number" style={{ color: 'var(--accent-amber)' }}>4.9★</div>
                  <div className="stat-mini-label">Patient Satisfaction</div>
                </div>
              </div>

              <div 
                style={{ 
                  marginTop: '20px', 
                  padding: '12px 14px', 
                  background: 'var(--primary-light)', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.82rem',
                  color: 'var(--primary-hover)',
                  fontWeight: 600
                }}
              >
                <Clock size={16} />
                <span>Today's OPD slots are currently filling. Reserve early to avoid delays.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
