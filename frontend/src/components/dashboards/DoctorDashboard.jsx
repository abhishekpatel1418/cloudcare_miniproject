import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Phone, 
  Mail, 
  FileText,
  Ban,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';
import { fetchAppointments, cancelAppointment } from '../../services/appointmentApi';

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const isAuthorized = user?.role === 'Doctor' || user?.role === 'Admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load appointments from backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [user]);

  if (!isAuthorized) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '540px',
          margin: '0 auto',
          background: 'var(--white)',
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <ShieldAlert size={48} color="#e11d48" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>
            Access Denied: Doctor Role Required
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '20px' }}>
            Your current account is authenticated as a <strong>{user?.role || 'Guest'}</strong>.
            In compliance with AWS Cognito RBAC, doctor dashboards are restricted to users assigned to the 
            <code>Doctor</code> Cognito User Pool group.
          </p>
        </div>
      </div>
    );
  }

  const handleCancelAppointment = async (appointmentId, patientName) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the appointment for ${patientName}? This will update the status to CANCELLED and release the reserved time slot.`
    );
    if (!confirmed) return;

    setActionInProgressId(appointmentId);
    setFeedback(null);

    try {
      await cancelAppointment(appointmentId);
      setFeedback({
        type: 'success',
        message: `Appointment ${appointmentId} has been successfully cancelled and the slot has been released.`
      });
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to cancel appointment.'
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleUnsupportedAction = (actionName) => {
    setFeedback({
      type: 'info',
      message: `"${actionName}" is not connected yet: The backend appointment status update endpoint (/appointments/{id}/status) is scheduled for Phase 3. Only cancellation is currently supported.`
    });
  };

  const confirmedList = appointments.filter((a) => a.status === 'CONFIRMED');
  const completedList = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelledList = appointments.filter((a) => a.status === 'CANCELLED');
  const totalRevenue = confirmedList.reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);

  const filteredAppointments = filterStatus === 'All'
    ? appointments
    : appointments.filter((a) => a.status === filterStatus);

  const renderStatusBadge = (status) => {
    if (status === 'CONFIRMED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-emerald-light)',
          color: 'var(--accent-emerald)'
        }}>
          <CheckCircle2 size={13} />
          <span>Confirmed</span>
        </span>
      );
    }
    if (status === 'COMPLETED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-light)',
          color: 'var(--primary)'
        }}>
          <Check size={13} />
          <span>Completed</span>
        </span>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: '#ffe4e6',
          color: '#be123c'
        }}>
          <XCircle size={13} />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--gray-100)',
        color: 'var(--gray-600)'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header Profile */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        border: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
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
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--secondary) 0%, #0f766e 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                {user.name}
              </h2>
              <span className="doctor-specialty-badge" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                OPD Physician Portal
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
              CloudCare Clinical Staff • User Pool Verified
            </p>
          </div>
        </div>

        <button onClick={loadData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Sync Patient Queue</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '0.88rem',
          background: feedback.type === 'success' 
            ? 'var(--accent-emerald-light)' 
            : feedback.type === 'error' 
              ? '#fff1f2' 
              : 'var(--primary-light)',
          color: feedback.type === 'success' 
            ? 'var(--accent-emerald)' 
            : feedback.type === 'error' 
              ? '#be123c' 
              : 'var(--primary-hover)',
          border: `1px solid ${
            feedback.type === 'success' 
              ? '#a7f3d0' 
              : feedback.type === 'error' 
                ? '#fecdd3' 
                : 'rgba(2, 132, 199, 0.25)'
          }`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' && <CheckCircle2 size={16} />}
            {feedback.type === 'error' && <AlertCircle size={16} />}
            {feedback.type === 'info' && <Info size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            style={{ fontSize: '0.8rem', fontWeight: 700, color: 'inherit', textDecoration: 'underline' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Doctor Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--secondary)' }}>{confirmedList.length}</div>
          <div className="stat-mini-label">Confirmed in Queue</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--primary)' }}>{completedList.length}</div>
          <div className="stat-mini-label">Completed Consultations</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: '#be123c' }}>{cancelledList.length}</div>
          <div className="stat-mini-label">Cancelled Slots</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number">₹{totalRevenue}</div>
          <div className="stat-mini-label">Active Queue Fees</div>
        </div>
      </div>

      {/* Patient Consultation Schedule */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Table Header and Filter Chips */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)' }}>
            Patient Consultations ({filteredAppointments.length})
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'All', value: 'All', count: appointments.length },
              { label: 'Confirmed', value: 'CONFIRMED', count: confirmedList.length },
              { label: 'Completed', value: 'COMPLETED', count: completedList.length },
              { label: 'Cancelled', value: 'CANCELLED', count: cancelledList.length }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`filter-chip ${filterStatus === tab.value ? 'active' : ''}`}
                style={{ fontSize: '0.78rem' }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Informational Strip about Action Capabilities */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--gray-50)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '0.8rem',
          color: 'var(--gray-600)'
        }}>
          <Info size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Action Support:</strong> Slot cancellation is connected and releases the slot. Status transitions ("Complete") are shown as disabled pending Phase 3 backend status update API deployment.
          </span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--gray-500)', padding: '20px 0' }}>Loading consultations from backend...</p>
        ) : filteredAppointments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '12px' }}>Ref ID</th>
                  <th style={{ padding: '12px' }}>Patient Name</th>
                  <th style={{ padding: '12px' }}>Contact</th>
                  <th style={{ padding: '12px' }}>Date & Slot</th>
                  <th style={{ padding: '12px' }}>Fee</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((item) => (
                  <tr key={item.appointmentId} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{item.appointmentId}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.patientName}</td>
                    <td style={{ padding: '12px', color: 'var(--gray-600)' }}>{item.patientEmail || item.patientPhone || '—'}</td>
                    <td style={{ padding: '12px' }}>{item.date} at {item.slot}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>₹{item.consultationFee}</td>
                    <td style={{ padding: '12px' }}>
                      {renderStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.status === 'CONFIRMED' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleCancelAppointment(item.appointmentId, item.patientName)}
                            disabled={actionInProgressId === item.appointmentId}
                            className="btn btn-outline btn-sm"
                            style={{
                              color: '#be123c',
                              borderColor: '#fecdd3',
                              padding: '5px 10px',
                              fontSize: '0.78rem'
                            }}
                            title="Cancel appointment and release slot"
                          >
                            <Ban size={13} />
                            <span>{actionInProgressId === item.appointmentId ? 'Cancelling...' : 'Cancel'}</span>
                          </button>

                          <button
                            onClick={() => handleUnsupportedAction('Mark as Completed')}
                            className="btn btn-outline btn-sm"
                            style={{
                              opacity: 0.55,
                              cursor: 'not-allowed',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              color: 'var(--gray-500)',
                              borderColor: 'var(--gray-300)'
                            }}
                            title="Disabled: Backend status update API pending in Phase 3"
                          >
                            <Check size={13} />
                            <span>Complete</span>
                          </button>
                        </div>
                      ) : item.status === 'COMPLETED' ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                          Consultation Concluded
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                          Slot Released
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--gray-500)', padding: '20px 0' }}>
            No appointments found matching "{filterStatus}".
          </p>
        )}
      </div>
    </div>
  );
}
