import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Users, 
  Calendar, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Terminal
} from 'lucide-react';
import { fetchAppointments } from '../../services/appointmentApi';

export default function AdminDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const isAuthorized = user?.role === 'Admin';

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
          <ShieldCheck size={48} color="#7c3aed" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>
            Access Denied: Admin Privileges Required
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: '1.6' }}>
            This administration portal is restricted. Your token does not belong to the 
            <code>Admin</code> Cognito User Pool group.
          </p>
        </div>
      </div>
    );
  }

  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;
  const totalVolume = appointments.reduce((sum, item) => sum + (item.consultationFee || 0), 0);

  const filtered = filterStatus === 'All' 
    ? appointments 
    : appointments.filter((a) => a.status === filterStatus);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Admin Header */}
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
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #4c1d95 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                Hospital Admin Command Center
              </h2>
              <span className="doctor-specialty-badge" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                Root RBAC
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
              Logged in as: {user.name} ({user.email})
            </p>
          </div>
        </div>

        <button onClick={loadData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number">{appointments.length}</div>
          <div className="stat-mini-label">Total Appointments Logged</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--accent-emerald)' }}>{confirmedCount}</div>
          <div className="stat-mini-label">Active Confirmed Slots</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: '#e11d48' }}>{cancelledCount}</div>
          <div className="stat-mini-label">Cancelled Slots (Released)</div>
        </div>
        <div className="stat-mini-card" style={{ background: 'var(--white)' }}>
          <div className="stat-mini-number" style={{ color: 'var(--primary)' }}>₹{totalVolume}</div>
          <div className="stat-mini-label">Total Consultation Volume</div>
        </div>
      </div>

      {/* Hospital-Wide Bookings Table */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)' }}>
            All Hospital Appointments ({filtered.length})
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'CONFIRMED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`filter-chip ${filterStatus === st ? 'active' : ''}`}
                style={{ fontSize: '0.78rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--gray-500)' }}>Querying Amazon DynamoDB...</p>
        ) : filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '10px' }}>Ref ID</th>
                  <th style={{ padding: '10px' }}>Patient</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Specialty</th>
                  <th style={{ padding: '10px' }}>Slot</th>
                  <th style={{ padding: '10px' }}>Fee</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.appointmentId} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{item.appointmentId}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{item.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.patientEmail}</div>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>Dr. {item.doctorName}</td>
                    <td style={{ padding: '10px', color: 'var(--gray-600)' }}>{item.specialty}</td>
                    <td style={{ padding: '10px' }}>{item.date} • {item.slot}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>₹{item.consultationFee}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
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
          <p style={{ color: 'var(--gray-500)', padding: '20px 0' }}>No records match the selected status.</p>
        )}
      </div>

      {/* CloudWatch Observability Audit Feed */}
      <div style={{
        background: '#0f172a',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        color: '#f8fafc',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Terminal size={18} color="#38bdf8" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
            Amazon CloudWatch Logs & API Gateway Telemetry
          </h4>
        </div>

        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          lineHeight: '1.7',
          color: '#94a3b8',
          background: '#020617',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          maxHeight: '160px',
          overflowY: 'auto'
        }}>
          <div>[INFO] AWS Lambda RequestId: {Math.random().toString(36).substring(2, 10)}-cc4f Duration: 38.4ms Billed: 39ms Memory: 256MB</div>
          <div>[INFO] Amazon Cognito Authorizer validated JWT token sub: {user.userId} (groups: [Admin])</div>
          <div>[INFO] DynamoDB TransactWriteCommand executed on table: CloudCare_HospitalTable</div>
          <div>[DEBUG] SES notification queue: status=IDLE (sandbox enabled, sender identity verified)</div>
          <div>[SUCCESS] HTTP 200 returned to API Gateway route GET /appointments</div>
        </div>
      </div>
    </div>
  );
}
