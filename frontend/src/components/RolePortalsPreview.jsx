import React, { useState } from 'react';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Info, 
  X, 
  Lock, 
  Database, 
  FileText, 
  Clock 
} from 'lucide-react';

export default function RolePortalsPreview({ activeRoleModal, setActiveRoleModal }) {
  const roles = [
    {
      id: "patient",
      title: "Patient Portal",
      badge: "Patient Experience",
      icon: User,
      iconClass: "patient",
      description: "Convenient self-service healthcare management for patients and families.",
      features: [
        "Register and secure login via Amazon Cognito",
        "Browse verified doctors by department & rating",
        "Book real-time OPD consultation slots",
        "View upcoming bookings & appointment history",
        "Instant cancellation & rescheduling with zero penalties",
        "Automated confirmation notifications via Amazon SES"
      ],
      plannedInPhase: "Phase 2 (Cognito + DynamoDB)"
    },
    {
      id: "doctor",
      title: "Doctor Dashboard",
      badge: "Physician & OPD",
      icon: Stethoscope,
      iconClass: "doctor",
      description: "Dedicated workspace for hospital doctors to manage patient flow and consultations.",
      features: [
        "Doctor credential login with Cognito role-based groups",
        "Live schedule view: daily, weekly, and monthly patient lists",
        "Set custom availability slots and blackout dates",
        "Mark appointment status: Completed, In-Progress, or No-Show",
        "Quick patient notes & consultation fee summary",
        "Automated sync with hospital OPD department calendar"
      ],
      plannedInPhase: "Phase 3 (Doctor Workflows)"
    },
    {
      id: "admin",
      title: "Admin Command Center",
      badge: "Hospital Management",
      icon: ShieldCheck,
      iconClass: "admin",
      description: "Comprehensive administrative oversight for hospital operations and cloud infrastructure.",
      features: [
        "Manage doctor profiles, verification & department mapping",
        "Monitor hospital-wide appointment volumes in real time",
        "System security & role assignments via AWS IAM & Cognito",
        "CloudWatch operational metrics & API error monitoring",
        "Patient feedback & hospital performance reporting",
        "Export consultation audits and departmental records"
      ],
      plannedInPhase: "Phase 3 (Admin Management)"
    }
  ];

  const currentRole = roles.find((r) => r.title.toLowerCase().startsWith((activeRoleModal || '').toLowerCase()));

  return (
    <section id="roles" className="section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Role-Based Access Control (RBAC)</span>
          <h2 className="section-title">Built for Patients, Doctors & Administrators</h2>
          <p className="section-desc">
            CloudCare provides three specialized operational portals secured with role-based policies 
            powered by Amazon Cognito User Pools and AWS IAM.
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.id} className="role-card">
                <div>
                  <div className={`role-icon-box ${role.iconClass}`}>
                    <Icon size={26} />
                  </div>
                  <span className="role-badge-pill">{role.badge}</span>
                  <h3 className="role-card-title">{role.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                    {role.description}
                  </p>
                </div>

                <ul className="role-feature-list">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="role-feature-item">
                      <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '10px' }}>
                    Targeted in {role.plannedInPhase}
                  </div>
                  <button
                    onClick={() => setActiveRoleModal(role.title.split(' ')[0])}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    <span>Inspect {role.title} Specs</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Specifications / Architecture Dialog */}
      {activeRoleModal && currentRole && (
        <div className="modal-overlay" onClick={() => setActiveRoleModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveRoleModal(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className={`role-icon-box ${currentRole.iconClass}`} style={{ marginBottom: 0 }}>
                {React.createElement(currentRole.icon, { size: 24 })}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                  {currentRole.title} – Implementation Architecture
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Scheduled Roadmap: {currentRole.plannedInPhase}
                </span>
              </div>
            </div>

            <div className="notice-box warning">
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Honest Academic Architecture Notice:</strong>
                <div>
                  This portal view is part of the planned multi-phase roadmap. 
                  Authentication is not yet connected to live AWS Cognito; 
                  credentials will be handled via JWT tokens and IAM policies in Phase 2.
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>
              Core Features to be wired to AWS:
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--dark-700)', lineHeight: '1.7' }}>
              {currentRole.features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>

            <div style={{ 
              marginTop: '20px', 
              padding: '12px 16px', 
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--gray-200)',
              fontSize: '0.84rem' 
            }}>
              <strong>AWS Security Note:</strong> All role-based API endpoints will require 
              Cognito Authorizer tokens passed in HTTP headers (`Authorization: Bearer &lt;id_token&gt;`).
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setActiveRoleModal(null)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
