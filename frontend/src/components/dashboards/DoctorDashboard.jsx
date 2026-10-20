import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  AlertTriangle,
  Save,
  RotateCcw,
  Settings,
  Users
} from 'lucide-react';
import { fetchAppointments, cancelAppointment } from '../../services/appointmentApi';
import { 
  getDoctorSchedule, 
  saveDoctorSchedule, 
  generateSlots, 
  validateSchedule, 
  detectScheduleConflicts, 
  ALL_WEEKDAYS, 
  VALID_SLOT_DURATIONS 
} from '../../services/doctorScheduleService';
import { doctorsData } from '../../data/doctorsData';

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'schedule'
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Identify matching doctor entity
  const matchedDoctor = useMemo(() => {
    return doctorsData.find(
      (d) => d.id === user?.userId || d.id === user?.doctorId || (user?.name && d.name.toLowerCase().includes(user.name.toLowerCase()))
    );
  }, [user]);

  const doctorId = matchedDoctor?.id || user?.userId || 'doc-1';
  const doctorName = matchedDoctor?.name || user?.name || 'Doctor';

  // Schedule management form state
  const [scheduleForm, setScheduleForm] = useState(() => getDoctorSchedule(doctorId));
  const [conflicts, setConflicts] = useState([]);
  const [saveInProgress, setSaveInProgress] = useState(false);

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
      setScheduleForm(getDoctorSchedule(doctorId));
    }
  }, [user, doctorId]);

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

  // Appointment cancellation
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

  // Schedule management handlers
  const handleToggleDay = (day) => {
    setScheduleForm((prev) => {
      const exists = prev.workingDays.includes(day);
      const newDays = exists 
        ? prev.workingDays.filter((d) => d !== day) 
        : [...prev.workingDays, day];
      return { ...prev, workingDays: newDays };
    });
    setConflicts([]);
  };

  const handleQuickDaySelect = (type) => {
    if (type === 'weekdays') {
      setScheduleForm((prev) => ({
        ...prev,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }));
    } else if (type === 'all') {
      setScheduleForm((prev) => ({ ...prev, workingDays: [...ALL_WEEKDAYS] }));
    } else if (type === 'clear') {
      setScheduleForm((prev) => ({ ...prev, workingDays: [] }));
    }
    setConflicts([]);
  };

  // Preview generated slots live
  const previewSlots = useMemo(() => {
    return generateSlots(scheduleForm.startTime, scheduleForm.endTime, scheduleForm.slotDuration);
  }, [scheduleForm.startTime, scheduleForm.endTime, scheduleForm.slotDuration]);

  const handleSaveSchedule = () => {
    setFeedback(null);
    setSaveInProgress(true);

    const validation = validateSchedule(scheduleForm);
    if (!validation.valid) {
      setFeedback({ type: 'error', message: validation.error });
      setSaveInProgress(false);
      return;
    }

    // Check for conflicts with existing booked appointments
    const detectedConflicts = detectScheduleConflicts(scheduleForm, appointments);
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setFeedback({
        type: 'error',
        message: `Schedule conflict detected: You have ${detectedConflicts.length} confirmed appointment(s) that conflict with this new schedule. Please resolve them first.`
      });
      setSaveInProgress(false);
      return;
    }

    try {
      saveDoctorSchedule(doctorId, scheduleForm, user, appointments);
      setConflicts([]);
      setFeedback({
        type: 'success',
        message: `OPD schedule and slots saved successfully for Dr. ${doctorName}! Patient booking forms are now updated with your new consultation hours.`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleResetSchedule = () => {
    setScheduleForm(getDoctorSchedule(doctorId));
    setConflicts([]);
    setFeedback({ type: 'info', message: 'Schedule editor reset to previously saved settings.' });
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
                {doctorName}
              </h2>
              <span className="doctor-specialty-badge" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                OPD Physician Portal
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
              Doctor ID: <code>{doctorId}</code> • User Pool Verified • Specialty: {matchedDoctor?.specialty || 'General'}
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setActiveTab('queue'); setFeedback(null); }}
            className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          >
            <Calendar size={15} />
            <span>Patient Queue</span>
          </button>

          <button
            onClick={() => { setActiveTab('schedule'); setFeedback(null); }}
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          >
            <Clock size={15} />
            <span>Schedule & Slots</span>
          </button>

          <button onClick={loadData} className="btn btn-outline btn-sm" title="Sync from backend">
            <RefreshCw size={14} />
          </button>
        </div>
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

      {/* TAB 1: PATIENT QUEUE */}
      {activeTab === 'queue' && (
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
      )}

      {/* TAB 2: SCHEDULE & SLOT MANAGEMENT */}
      {activeTab === 'schedule' && (
        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                OPD Schedule & Slot Management
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                Configure your consultation hours, working days, and slot capacity. Changes generate the available booking slots for patients.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleResetSchedule} className="btn btn-outline btn-sm">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              <button 
                onClick={handleSaveSchedule} 
                disabled={saveInProgress}
                className="btn btn-primary btn-sm"
              >
                <Save size={14} />
                <span>{saveInProgress ? 'Saving...' : 'Save Schedule'}</span>
              </button>
            </div>
          </div>

          {/* Persistence Limitations Notice */}
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '24px',
            fontSize: '0.82rem',
            color: 'var(--primary-hover)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Local Demo Persistence Notice:</strong>
              <div>
                Doctor schedules are currently saved to structured local storage for this demo environment. 
                In production (Phase 3 AWS backend deployment), this will synchronize to an Amazon DynamoDB 
                <code>DOCTOR#{doctorId} / SCHEDULE</code> item across all user devices.
              </div>
            </div>
          </div>

          {/* Schedule Conflict Warnings */}
          {conflicts.length > 0 && (
            <div style={{
              background: '#fff1f2',
              border: '1.5px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be123c', fontWeight: 700, marginBottom: '8px' }}>
                <AlertTriangle size={18} />
                <span>Existing Appointment Conflicts ({conflicts.length})</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#9f1239', marginBottom: '12px' }}>
                The proposed schedule conflicts with confirmed appointments already on your calendar. 
                CloudCare protects booked appointments and will <strong>NOT</strong> silently cancel or move them. 
                Please resolve these bookings before changing your hours:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {conflicts.map((c, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    border: '1px solid #fecdd3',
                    color: 'var(--dark-800)'
                  }}>
                    <strong>{c.appointmentId}</strong>: {c.patientName} on {c.date} at {c.slot} — <span style={{ color: '#be123c' }}>{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 1: WORKING DAYS */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-800)' }}>
                1. Working Days
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => handleQuickDaySelect('weekdays')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  Mon - Fri
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickDaySelect('all')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  All 7 Days
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickDaySelect('clear')}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_WEEKDAYS.map((day) => {
                const isSelected = scheduleForm.workingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--gray-300)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--white)',
                      color: isSelected ? 'var(--primary-hover)' : 'var(--dark-700)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: OPD HOURS & DURATION */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '6px' }}>
                OPD Start Time
              </label>
              <input
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => {
                  setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }));
                  setConflicts([]);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '6px' }}>
                OPD End Time
              </label>
              <input
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => {
                  setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }));
                  setConflicts([]);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '6px' }}>
                Slot Duration (Minutes)
              </label>
              <select
                value={scheduleForm.slotDuration}
                onChange={(e) => {
                  setScheduleForm((prev) => ({ ...prev, slotDuration: Number(e.target.value) }));
                  setConflicts([]);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.9rem',
                  backgroundColor: 'white'
                }}
              >
                {VALID_SLOT_DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>{dur} Minutes per consultation</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 3: BOOKING CAPACITIES */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '18px',
            marginBottom: '28px',
            padding: '16px',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '4px' }}>
                Max Bookings Per Slot
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={scheduleForm.maxBookingsPerSlot}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, maxBookingsPerSlot: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.88rem'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
                Number of patients allowed in the same slot (default: 1)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '4px' }}>
                Daily Maximum Bookings Limit
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={scheduleForm.dailyMaxBookings}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, dailyMaxBookings: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--gray-200)',
                  fontSize: '0.88rem'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
                Caps total bookings accepted in a single day (default: 15)
              </span>
            </div>
          </div>

          {/* SECTION 4: LIVE SLOTS PREVIEW */}
          <div style={{
            borderTop: '1px solid var(--gray-200)',
            paddingTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-800)' }}>
                Generated Consultation Slots Preview ({previewSlots.length} slots)
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {scheduleForm.startTime} to {scheduleForm.endTime} • {scheduleForm.slotDuration} min intervals
              </span>
            </div>

            {previewSlots.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
                {previewSlots.map((slot, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-hover)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Clock size={12} />
                    <span>{slot}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#be123c', fontSize: '0.84rem' }}>
                No slots generated. Ensure start time is earlier than end time and the working duration is at least {scheduleForm.slotDuration} minutes.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
