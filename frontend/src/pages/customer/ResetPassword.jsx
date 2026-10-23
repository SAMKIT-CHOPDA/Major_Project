import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../utils/useToast';

// ── Shell is defined OUTSIDE the component so React never recreates it ────────
// If Shell were inside ResetPassword, every state change would make React treat
// it as a brand-new component type, unmount + remount it, and kill input focus.
const Shell = ({ toasts, children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
    <ToastContainer toasts={toasts} />
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      backgroundImage: `linear-gradient(rgba(255,107,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,26,0.03) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }} />
    <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 40, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, background: 'var(--orange)', clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--black)' }}>⚙</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)', letterSpacing: '0.08em' }}>
          MOTO<span style={{ color: 'var(--orange)' }}>PARTS</span>
        </span>
      </Link>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const ResetPassword = () => {
  const [searchParams]                  = useSearchParams();
  const token                           = searchParams.get('token');
  const fromAdmin                       = searchParams.get('from') === 'admin';
  const redirectTo                      = fromAdmin ? '/admin/login' : '/login';
  const redirectLabel                   = fromAdmin ? 'Admin Login' : 'Login';

  const [verifyStatus, setVerifyStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid'
  const [verifyError, setVerifyError]   = useState('');
  const [form, setForm]                 = useState({ password: '', confirm: '' });
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  const navigate                        = useNavigate();
  const { toasts, success, error: toastError } = useToast();

  // ── Verify token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setVerifyError('No reset token found in the URL. Please use the link from your email.');
      setVerifyStatus('invalid');
      return;
    }

    axios
      .get(`/api/email/changepassword/verify?token=${encodeURIComponent(token)}`)
      .then(() => setVerifyStatus('valid'))
      .catch((err) => {
        const status  = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 404)       setVerifyError(message || 'This reset link is invalid or has already been used.');
        else if (status === 400)  setVerifyError(message || 'The reset link is malformed. Please request a new one.');
        else if (status === 500)  setVerifyError('A server error occurred while verifying your link. Please try again later.');
        else if (!err.response)   setVerifyError('Unable to reach the server. Please check your connection and try again.');
        else                      setVerifyError(message || 'An unexpected error occurred. Please request a new reset link.');

        setVerifyStatus('invalid');
      });
  }, [token]);

  // ── Validation — minimum 8 characters ─────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.password)                  errs.password = 'Password is required.';
    else if (form.password.length < 8)   errs.password = 'Password must be at least 8 characters.';
    if (!form.confirm)                   errs.confirm  = 'Please confirm your password.';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  // ── Submit new password ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await axios.post('/api/email/changepassword/newpassword', {
        token,
        password: form.password,
      });
      success('Password updated! Redirecting...');
      setDone(true);
      setTimeout(() => navigate(redirectTo, { replace: true }), 1500);

    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400)       toastError(message || 'Invalid request. Please check your input.');
      else if (status === 404)  toastError(message || 'Reset link expired or already used. Please request a new one.');
      else if (status === 500)  toastError('Server error. Please try again in a moment.');
      else if (!err.response)   toastError('No connection to server. Check your internet and try again.');
      else                      toastError(message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (verifyStatus === 'loading') {
    return (
      <Shell toasts={toasts}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            Verifying your link...
          </p>
        </div>
      </Shell>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (verifyStatus === 'invalid') {
    return (
      <Shell toasts={toasts}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⚠️</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 3, height: 28, background: 'var(--danger, #e74c3c)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0 }}>INVALID LINK</h3>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 28, lineHeight: 1.6 }}>
            {verifyError}
          </p>
          <Link
            to={fromAdmin ? '/forgot-password?from=admin' : '/forgot-password'}
            className="btn btn-primary btn-full"
            style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            REQUEST NEW LINK
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to={redirectTo} style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            ← Back to {redirectLabel}
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <Shell toasts={toasts}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 12 }}>PASSWORD UPDATED</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Redirecting you to {redirectLabel}...</p>
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, margin: '20px auto 0' }} />
        </div>
      </Shell>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <Shell toasts={toasts}>
      <div className="card" style={{ padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 3, height: 28, background: 'var(--orange)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0 }}>RESET PASSWORD</h3>
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: '0.9rem' }}>
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ borderColor: errors.password ? 'var(--danger)' : undefined, paddingRight: 42, pointerEvents: 'auto', userSelect: 'text', position: 'relative', zIndex: 2 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                className="form-control"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ borderColor: errors.confirm ? 'var(--danger)' : undefined, paddingRight: 42, pointerEvents: 'auto', userSelect: 'text', position: 'relative', zIndex: 2 }}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirm && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8, height: 48 }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Updating...</>
              : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to={redirectTo} style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          ← Back to {redirectLabel}
        </Link>
      </div>
    </Shell>
  );
};

export default ResetPassword;