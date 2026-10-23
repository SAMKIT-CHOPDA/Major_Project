import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../utils/useToast';

const ForgotPassword = () => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [timer, setTimer]       = useState(0);
  const [error, setError]       = useState('');
  const intervalRef             = useRef(null);
  const { toasts, success, error: toastError } = useToast();
  const location                = useLocation();

  const params    = new URLSearchParams(location.search);
  const fromAdmin = params.get('from') === 'admin';
  const backLink  = fromAdmin ? '/admin/login' : '/login';
  const backLabel = fromAdmin ? '← Admin Login' : '← Back to Login';

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const startTimer = () => {
    setTimer(60);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/email/changepassword/request?email=${encodeURIComponent(email)}`);
      return true;
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 400)       toastError(message || 'Invalid email address.');
      else if (status === 404)  toastError(message || 'No account found with that email.');
      else if (status === 500)  toastError(message || 'Server error. Please try again later.');
      else if (!err.response)   toastError('Cannot reach the server. Check your connection.');
      else                      toastError(message || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim())               { setError('Email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    const ok = await sendRequest();
    if (ok) { setSent(true); success('Reset link sent! Check your inbox.'); startTimer(); }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    const ok = await sendRequest();
    if (ok) { success('Reset link resent!'); startTimer(); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <ToastContainer toasts={toasts} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(255,107,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,26,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 40, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--orange)', clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--black)' }}>⚙</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)', letterSpacing: '0.08em' }}>
            MOTO<span style={{ color: 'var(--orange)' }}>PARTS</span>
          </span>
        </Link>

        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 3, height: 28, background: 'var(--orange)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0 }}>FORGOT PASSWORD</h3>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: '0.9rem' }}>
            {sent ? `A reset link was sent to ${email}. Check your inbox.` : "Enter your registered email and we'll send you a reset link."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email" className="form-control" placeholder="you@example.com"
                  value={email} autoComplete="email"
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  style={{ borderColor: error ? 'var(--danger)' : undefined }}
                />
                {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, height: 48 }}>
                {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Sending...</> : 'SEND RESET LINK'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ background: 'rgba(255,107,26,0.08)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 8, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>📧</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--orange)', letterSpacing: '0.05em' }}>LINK SENT</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 2 }}>Click the link in your email to reset your password.</div>
                </div>
              </div>

              <button onClick={handleResend} disabled={timer > 0 || loading} className="btn btn-full"
                style={{ height: 48, background: 'transparent', border: '1px solid', borderColor: timer > 0 ? 'rgba(255,255,255,0.1)' : 'var(--orange)', color: timer > 0 ? 'var(--muted)' : 'var(--orange)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', cursor: timer > 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Resending...</>
                  : timer > 0 ? `RESEND IN ${timer}s` : 'RESEND LINK'}
              </button>

              {timer > 0 && (
                <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--orange)', width: `${(timer / 60) * 100}%`, transition: 'width 1s linear', borderRadius: 2 }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to={backLink} style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{backLabel}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;