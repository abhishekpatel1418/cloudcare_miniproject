import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { fetchAppointments } from '../../services/appointmentApi';

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAuthorized = user?.role === 'Doctor' || user?.role === 'Admin';

  const loadData = async () => {
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

  const confirmedList = appointments.filter((a) => a.status === 'CONFIRMED');
  const totalRevenue = confirmedList.reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header Profile */}
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

      {/* Doctor Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--secondary)' }}>{confirmedList.length}</div>
          <div className="stat-mini-label">Upcoming Patients in Queue</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number">₹{totalRevenue}</div>
          <div className="stat-mini-label">Estimated Consultation Fees</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--accent-emerald)' }}>Active</div>
          <div className="stat-mini-label">OPD Room Status</div>
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
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '16px' }}>
          Scheduled Patient Consultations ({appointments.length})
        </h3>

        {loading ? (
          <p style={{ color: 'var(--gray-500)' }}>Loading consultations from DynamoDB...</p>
        ) : appointments.length > 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.appointmentId} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{item.appointmentId}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.patientName}</td>
                    <td style={{ padding: '12px', color: 'var(--gray-600)' }}>{item.patientEmail || item.patientPhone || '—'}</td>
                    <td style={{ padding: '12px' }}>{item.date} at {item.slot}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>₹{item.consultationFee}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: item.status === 'CONFIRMED' ? 'var(--accent-emerald-light)' : '#ffe4e6',
                        color: item.status === 'CONFIRMED' ? 'var(--accent-emerald)' : '#be123c'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--gray-500)', padding: '20px 0' }}>No consultations found for your doctor ID.</p>
        )}
      </div>
    </div>
  );
}
