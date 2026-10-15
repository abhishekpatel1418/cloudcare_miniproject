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
  AlertCircle,
  LogIn
} from 'lucide-react';
import { createAppointment } from '../services/appointmentApi';

export default function DoctorModal({ doctor, onClose, user, onRequireAuth }) {
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableSlots?.[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientPhone, setPatientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!doctor) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: selectedDate,
        slot: selectedSlot,
        patientName: user.name,
        patientEmail: user.email,
        patientPhone: patientPhone || '',
        consultationFee: doctor.consultationFee,
        hospitalLocation: doctor.hospitalLocation
      };

      const result = await createAppointment(payload);
      setConfirmedBooking(result);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!confirmedBooking ? (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="doctor-avatar" style={{ width: '60px', height: '60px', fontSize: '1.3rem' }}>
                {doctor.initials}
              </div>
              <div>
                <span className="doctor-specialty-badge" style={{ marginBottom: '6px' }}>
                  {doctor.specialty}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                  {doctor.name}
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                  {doctor.qualification}
                </p>
              </div>
            </div>

            {/* Doctor Bio */}
            <div style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: '1.5', marginBottom: '16px' }}>
              {doctor.bio}
            </div>

            {/* Quick Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: '10px',
              padding: '12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>Experience</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doctor.experience} Yrs</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>Rating</span>
                <div style={{ fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.9rem' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  {doctor.rating} ({doctor.reviewsCount})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>Consultation Fee</span>
                <div style={{ fontWeight: 800, color: 'var(--dark-900)', fontSize: '0.9rem' }}>₹{doctor.consultationFee}</div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Authentication Guard */}
            {!user ? (
              <div style={{
                background: 'var(--primary-light)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                margin: '18px 0'
              }}>
                <LogIn size={32} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '6px' }}>
                  Patient Sign In Required
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '16px' }}>
                  To reserve an appointment and secure your slot in Amazon DynamoDB, please authenticate with your patient account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequireAuth();
                  }}
                  className="btn btn-primary"
                >
                  <LogIn size={15} />
                  <span>Sign In / Create Account</span>
                </button>
              </div>
            ) : (
              /* Booking Form for Authenticated Patient */
              <form onSubmit={handleBookingSubmit}>
                {/* Date and Slot selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '6px' }}>
                      Consultation Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--gray-200)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '6px' }}>
                      Contact Mobile
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--gray-200)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                {/* Slot Selector */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '8px' }}>
                    Select Consultation Slot:
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
                          fontSize: '0.84rem',
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

                {/* Patient Summary Card */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Booking as: </span>
                    <strong>{user.name}</strong> ({user.email})
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}>
                    {user.role}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Reserving Slot with Backend...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '6px' }}>
              Appointment Confirmed!
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '20px' }}>
              Your appointment has been registered in the database.
            </p>

            <div style={{
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              maxWidth: '440px',
              margin: '0 auto 20px auto',
              border: '1px solid var(--gray-200)',
              fontSize: '0.88rem'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Reference ID: </span>
                <strong style={{ color: 'var(--primary)' }}>{confirmedBooking.appointmentId}</strong>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Doctor: </span>
                <strong>Dr. {confirmedBooking.doctorName}</strong> ({confirmedBooking.specialty})
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Date & Slot: </span>
                <strong>{confirmedBooking.date} at {confirmedBooking.slot}</strong>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Patient: </span>
                <strong>{confirmedBooking.patientName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--gray-500)' }}>Location: </span>
                <span>{confirmedBooking.hospitalLocation}</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ minWidth: '140px' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
