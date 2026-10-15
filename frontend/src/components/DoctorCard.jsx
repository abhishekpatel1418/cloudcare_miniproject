import React from 'react';
import { Star, Clock, MapPin, CheckCircle, Calendar, ArrowRight } from 'lucide-react';

export default function DoctorCard({ doctor, onBookClick, onViewProfile }) {
  const isAvailableToday = doctor.availableToday;

  return (
    <div className="doctor-card">
      {/* Top Header */}
      <div className="doctor-header">
        <div className="doctor-avatar">
          {doctor.initials}
        </div>

        <div className="doctor-title-box">
          <h3 className="doctor-name">{doctor.name}</h3>
          <span className="doctor-specialty-badge">
            {doctor.specialty}
          </span>
          <p className="doctor-qualifications">
            {doctor.qualification}
          </p>
        </div>
      </div>

      {/* Hospital Location info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '12px' }}>
        <MapPin size={14} />
        <span>{doctor.hospitalLocation}</span>
      </div>

      {/* Stats Row (Rating & Experience) */}
      <div className="doctor-stats-row">
        <div className="rating-pill">
          <Star size={15} fill="#f59e0b" color="#f59e0b" />
          <span>{doctor.rating}</span>
          <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>({doctor.reviewsCount})</span>
        </div>
        <div className="exp-pill">
          <strong>{doctor.experience} yrs</strong> experience
        </div>
      </div>

      {/* Available Slots Preview */}
      <div className="doctor-slots-box">
        <div className="slots-label">
          <span>{isAvailableToday ? 'Available Slots Today' : 'Next Open Slots'}</span>
          <span style={{ 
            color: isAvailableToday ? 'var(--accent-emerald)' : 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {doctor.availabilityStatus}
          </span>
        </div>

        <div className="slots-grid">
          {doctor.availableSlots.slice(0, 3).map((slot, index) => (
            <span key={index} className="slot-tag">
              <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {slot}
            </span>
          ))}
          {doctor.availableSlots.length > 3 && (
            <span className="slot-tag" style={{ background: 'var(--gray-200)' }}>
              +{doctor.availableSlots.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Fee & Action */}
      <div className="doctor-card-footer">
        <div className="fee-block">
          <span className="fee-label">Consultation Fee</span>
          <span className="fee-value">₹{doctor.consultationFee}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onBookClick(doctor)}
            className="btn btn-primary btn-sm"
          >
            <span>Book Appointment</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
