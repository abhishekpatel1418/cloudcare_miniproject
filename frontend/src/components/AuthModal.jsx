import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  KeyRound,
  Info
} from 'lucide-react';
import { 
  registerUser, 
  confirmUserRegistration, 
  loginUser, 
  loginLocalEvaluationUser,
  isCognitoConfigured 
} from '../services/cognitoAuth';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'confirm'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const cognitoReady = isCognitoConfigured();

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password, phone });
      setLoading(false);
      setSuccessNotice(`Registration successful! Verification code sent to ${email}.`);
      setTab('confirm');
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Registration failed');
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await confirmUserRegistration({ email, code: confirmationCode });
      setLoading(false);
      setSuccessNotice('Email verified! You can now sign in.');
      setTab('login');
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Confirmation failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const session = await loginUser({ email, password });
      setLoading(false);
      onAuthSuccess(session);
      onClose();
    } catch (err) {
      setLoading(false);
      if (err.name === 'UserNotConfirmedException') {
        setErrorMessage('Your account is not verified yet. Please enter the 6-digit code sent to your email.');
        setTab('confirm');
      } else {
        setErrorMessage(err.message || 'Invalid email or password.');
      }
    }
  };

  const handleLocalDemoLogin = (role) => {
    const session = loginLocalEvaluationUser(role);
    onAuthSuccess(session);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* AWS Connection Status Pill */}
        <div style={{ marginBottom: '16px' }}>
          {cognitoReady ? (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--accent-emerald)', 
              background: 'var(--accent-emerald-light)', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              <CheckCircle2 size={13} />
              <span>Amazon Cognito User Pool: Connected</span>
            </div>
          ) : (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: '#b45309', 
              background: '#fef3c7', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              <AlertCircle size={13} />
              <span>AWS Cognito: Awaiting .env credentials</span>
            </div>
          )}
        </div>

        {/* Tabs: Sign In / Create Account */}
        {tab !== 'confirm' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: '20px' }}>
            <button
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                borderBottom: tab === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === 'login' ? 'var(--primary)' : 'var(--gray-500)',
                transition: 'var(--transition)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                borderBottom: tab === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === 'register' ? 'var(--primary)' : 'var(--gray-500)',
                transition: 'var(--transition)'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div style={{
            background: 'var(--accent-emerald-light)',
            border: '1px solid #a7f3d0',
            color: 'var(--accent-emerald)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            <div>{successNotice}</div>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '6px' }}>
                Password
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {loading ? 'Authenticating with AWS...' : 'Sign In to Portal'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '4px' }}>
                Full Name
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '4px' }}>
                Email Address (User Pool Username)
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '4px' }}>
                Password (min 8 chars, uppercase, lowercase & number)
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-700)', marginBottom: '4px' }}>
                Mobile Phone (Optional)
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--gray-500)', 
              background: 'var(--gray-100)', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px' 
            }}>
              <strong>Role Security:</strong> Self-registration creates a <strong>Patient</strong> account. 
              Doctor & Admin privileges are assigned securely by hospital administrators via Cognito Groups.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Account in Cognito...' : 'Register with Amazon Cognito'}
            </button>
          </form>
        )}

        {/* 3. CONFIRM EMAIL VERIFICATION FORM */}
        {tab === 'confirm' && (
          <form onSubmit={handleConfirm}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <KeyRound size={36} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Confirm Your Email</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                Enter the 6-digit confirmation code sent to <strong>{email}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  letterSpacing: '0.3em',
                  fontWeight: 700,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--primary)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {loading ? 'Verifying...' : 'Confirm & Complete Registration'}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
              onClick={() => setTab('login')}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* EVALUATOR TEST ACCOUNTS (For B.Tech Project Examiner Assessment) */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--gray-200)' 
        }}>
          <div style={{ 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            color: 'var(--gray-500)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.04em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Mini-Project Evaluator Mode: Test RBAC Roles</span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '10px' }}>
            Instant role evaluation test switcher (bypasses live Cognito network request for local demonstrations):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleLocalDemoLogin('Patient')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 4px' }}
            >
              Patient Role
            </button>
            <button
              type="button"
              onClick={() => handleLocalDemoLogin('Doctor')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 4px' }}
            >
              Doctor Role
            </button>
            <button
              type="button"
              onClick={() => handleLocalDemoLogin('Admin')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 4px' }}
            >
              Admin Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
