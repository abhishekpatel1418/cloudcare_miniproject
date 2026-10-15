import React from 'react';
import { Activity, Mail, Phone, MapPin, Heart, Shield } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '12px' }}>
              <div className="brand-icon">
                <Activity size={22} />
              </div>
              <div>
                Cloud<span style={{ color: 'var(--primary)' }}>Care</span>
              </div>
            </div>

            <p className="footer-desc">
              A cloud-native hospital appointment management platform engineered for seamless doctor-patient scheduling, 
              built on scalable AWS Serverless architecture.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>CloudCare Health Campus, Tech Enclave</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--primary)" />
                <span>+91 1800-CLOUDCAR (Toll Free 24/7)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--primary)" />
                <span>support@cloudcare-health.local</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
              <li><a href="#specialties" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('specialties'); }}>Specialties</a></li>
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>Doctor Directory</a></li>
              <li><a href="#how-it-works" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}>How It Works</a></li>
              <li><a href="#roles" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('roles'); }}>Role Dashboards</a></li>
            </ul>
          </div>

          {/* Clinical Departments */}
          <div>
            <h4 className="footer-col-title">Top Departments</h4>
            <ul className="footer-links">
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>Cardiology</a></li>
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>Neurology</a></li>
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>Orthopedics</a></li>
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>Pediatrics</a></li>
              <li><a href="#doctors" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('doctors'); }}>General Medicine</a></li>
            </ul>
          </div>

          {/* Project & Tech Note */}
          <div>
            <h4 className="footer-col-title">Academic Project Notice</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)', lineHeight: '1.6', marginBottom: '14px' }}>
              2nd-Year B.Tech CSE Mini Project: <strong>CloudCare</strong>.
              Engineered with React + Vite, Node.js AWS Lambda, API Gateway, DynamoDB, and Cognito.
            </p>
            <div style={{ 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--gray-100)',
              fontSize: '0.78rem',
              color: 'var(--gray-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield size={16} color="var(--primary)" />
              <span>Phase 1 Frontend Foundation Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} CloudCare Health Systems. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Built with care for B.Tech Mini Project Showcase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
