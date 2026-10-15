import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  AlertCircle 
} from 'lucide-react';

export default function DoctorModal({ doctor, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableSlots?.[0] || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!doctor) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    setBookingConfirmed(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!bookingConfirmed ? (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div className="doctor-avatar" style={{ width: '64px', height: '64px', fontSize: '1.4rem' }}>
                {doctor.initials}
              </div>
              <div>
                <span className="doctor-specialty-badge" style={{ marginBottom: '6px' }}>
                  {doctor.specialty}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                  {doctor.name}
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                  {doctor.qualification}
                </p>
              </div>
            </div>

            {/* Doctor Bio */}
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '20px' }}>
              {doctor.bio}
            </div>

            {/* Meta info pills */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px',
              padding: '14px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Experience
                </span>
                <div style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{doctor.experience} Years</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Patient Rating
                </span>
                <div style={{ fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  {doctor.rating} ({doctor.reviewsCount})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Consultation Fee
                </span>
                <div style={{ fontWeight: 800, color: 'var(--dark-900)' }}>₹{doctor.consultationFee}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Languages
                </span>
                <div style={{ fontWeight: 600, color: 'var(--dark-700)', fontSize: '0.82rem' }}>
                  {doctor.languages.join(', ')}
                </div>
              </div>
            </div>

            {/* Slot Selection Form */}
            <form onSubmit={handleConfirm}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '8px' }}>
                  Select Consultation Time Slot ({doctor.availabilityStatus}):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {doctor.availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: selectedSlot === slot ? '2px solid var(--primary)' : '1px solid var(--gray-300)',
                        backgroundColor: selectedSlot === slot ? 'var(--primary-light)' : 'var(--white)',
                        color: selectedSlot === slot ? 'var(--primary-hover)' : 'var(--dark-800)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <Clock size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Quick Details (demonstration input) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '6px' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--gray-200)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--gray-200)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              {/* Phase 1 Notice Box */}
              <div className="notice-box warning">
                <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Phase 1 UI Foundation:</strong>
                  <div>
                    This booking dialog previews slot reservation in the local state. In Phase 2, 
                    this will connect to <strong>AWS Cognito</strong> authentication, 
                    <strong>API Gateway</strong>, and persist records in <strong>Amazon DynamoDB</strong>.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Confirm Slot Reservation</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>
              Slot Pre-Reserved (Demo)
            </h3>

            <p style={{ fontSize: '0.92rem', color: 'var(--gray-600)', maxWidth: '440px', margin: '0 auto 20px auto' }}>
              Appointment request for <strong>{patientName || 'Patient'}</strong> with <strong>{doctor.name}</strong> has been logged.
            </p>

            <div style={{ 
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px', 
              textAlign: 'left',
              maxWidth: '440px',
              margin: '0 auto 24px auto',
              border: '1px solid var(--gray-200)',
              fontSize: '0.88rem'
            }}>
              <div style={{ marginBottom: '6px' }}><strong>Doctor:</strong> {doctor.name} ({doctor.specialty})</div>
              <div style={{ marginBottom: '6px' }}><strong>Time Slot:</strong> {selectedSlot}</div>
              <div style={{ marginBottom: '6px' }}><strong>Location:</strong> {doctor.hospitalLocation}</div>
              <div><strong>Status:</strong> Ready for DynamoDB pipeline (Phase 2)</div>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ minWidth: '160px' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
