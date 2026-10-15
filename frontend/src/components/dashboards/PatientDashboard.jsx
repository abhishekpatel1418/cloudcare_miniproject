import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { fetchAppointments, cancelAppointment } from '../../services/appointmentApi';

export default function PatientDashboard({ user, onBookNewClick, onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancellingId(appointmentId);
    setMessage('');
    try {
      await cancelAppointment(appointmentId);
      setMessage("Appointment cancelled successfully. Slot has been released.");
      await loadAppointments();
    } catch (err) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = appointments.filter((a) => a.status === 'CONFIRMED');
  const pastOrCancelled = appointments.filter((a) => a.status !== 'CONFIRMED');

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Patient Header Card */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                {user.name}
              </h2>
              <span className="doctor-specialty-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Role: Patient
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
              {user.email} • ID: {user.userId.slice(0, 16)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadAppointments} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button onClick={onBookNewClick} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          background: 'var(--accent-emerald-light)',
          color: 'var(--accent-emerald)',
          border: '1px solid #a7f3d0',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Upcoming Active Appointments */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '16px' }}>
          Upcoming Appointments ({upcoming.length})
        </h3>

        {loading ? (
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Loading appointment records from backend...</p>
        ) : upcoming.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {upcoming.map((item) => (
              <div 
                key={item.appointmentId}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--gray-200)',
                  borderLeft: '4px solid var(--primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Ref: {item.appointmentId}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-900)' }}>
                      Dr. {item.doctorName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{item.specialty}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-emerald-light)',
                    color: 'var(--accent-emerald)'
                  }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span><strong>Date:</strong> {item.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="var(--primary)" />
                    <span><strong>Time:</strong> {item.slot}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>{item.hospitalLocation}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)' }}>
                    Fee: ₹{item.consultationFee}
                  </span>
                  <button
                    onClick={() => handleCancel(item.appointmentId)}
                    disabled={cancellingId === item.appointmentId}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#e11d48', borderColor: '#fecdd3' }}
                  >
                    {cancellingId === item.appointmentId ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '32px' }}>
            <p style={{ color: 'var(--gray-500)', marginBottom: '14px' }}>You have no upcoming appointments.</p>
            <button onClick={onBookNewClick} className="btn btn-primary btn-sm">
              Schedule Your First Consultation
            </button>
          </div>
        )}
      </div>

      {/* Booking History (Completed & Cancelled) */}
      {pastOrCancelled.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '16px' }}>
            Past & Cancelled Bookings ({pastOrCancelled.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {pastOrCancelled.map((item) => (
              <div 
                key={item.appointmentId}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  opacity: 0.85
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Dr. {item.doctorName}</h4>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: item.status === 'CANCELLED' ? '#ffe4e6' : 'var(--gray-100)',
                    color: item.status === 'CANCELLED' ? '#be123c' : 'var(--gray-600)'
                  }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                  Ref: {item.appointmentId} • {item.date} at {item.slot}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
