import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      {/* Background effects */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-20%', right:'-10%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:'var(--accent-glow)', border:'1px solid rgba(56,189,248,0.3)', borderRadius:16, marginBottom:'1rem' }}>
            <Map size={28} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2rem', fontWeight:800, letterSpacing:'-0.02em' }}>Wandr</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Smart travel, beautifully planned</p>
        </div>

        <div className="card" style={{ borderRadius:'var(--radius-lg)' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.25rem', fontWeight:700, marginBottom:'1.5rem' }}>Welcome back</h2>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius)', padding:'0.75rem 1rem', marginBottom:'1rem', color:'var(--red)', fontSize:'0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight:'3rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'0.85rem' }}>
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--text-2)', fontSize:'0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
