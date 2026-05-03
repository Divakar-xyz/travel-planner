import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STYLES = ['adventure', 'cultural', 'relaxation', 'foodie', 'nature', 'urban'];
const BUDGETS = ['budget', 'mid-range', 'luxury'];
const INTERESTS = ['museums','restaurants','parks','shopping','nightlife','beaches','history','art','sports','photography'];

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', preferences:{ budgetRange:'mid-range', travelStyle:'cultural', interests:[] } });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    const curr = form.preferences.interests;
    setForm({ ...form, preferences: { ...form.preferences, interests: curr.includes(interest) ? curr.filter(i=>i!==interest) : [...curr, interest] } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ position:'fixed', top:'-20%', right:'-10%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:480, animation:'fadeIn 0.4s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:'var(--accent-glow)', border:'1px solid rgba(56,189,248,0.3)', borderRadius:16, marginBottom:'1rem' }}>
            <Map size={28} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2rem', fontWeight:800, letterSpacing:'-0.02em' }}>Wandr</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.25rem' }}>Create your travel profile</p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', justifyContent:'center' }}>
          {[1,2].map(s => (
            <div key={s} style={{ width:40, height:4, borderRadius:2, background: s <= step ? 'var(--accent)' : 'var(--border)', transition:'background 0.3s' }} />
          ))}
        </div>

        <div className="card" style={{ borderRadius:'var(--radius-lg)' }}>
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius)', padding:'0.75rem 1rem', marginBottom:'1rem', color:'var(--red)', fontSize:'0.875rem' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.25rem', fontWeight:700, marginBottom:'1.5rem' }}>Basic Info</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input className="input" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="input" type={showPw?'text':'password'} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{ paddingRight:'3rem' }} />
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}>
                      {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.85rem' }}
                  onClick={()=>{ if(!form.name||!form.email||form.password.length<6){setError('Fill all fields (password min 6 chars)');return;} setError(''); setStep(2); }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.25rem', fontWeight:700, marginBottom:'1.5rem' }}>Travel Preferences</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div>
                  <label className="input-label">Budget Style</label>
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                    {BUDGETS.map(b => (
                      <button key={b} type="button" onClick={()=>setForm({...form,preferences:{...form.preferences,budgetRange:b}})}
                        style={{ padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:`1px solid ${form.preferences.budgetRange===b?'var(--accent)':'var(--border)'}`, background: form.preferences.budgetRange===b?'var(--accent-glow)':'transparent', color: form.preferences.budgetRange===b?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.8rem', textTransform:'capitalize', transition:'all 0.2s' }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Travel Style</label>
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                    {STYLES.map(s => (
                      <button key={s} type="button" onClick={()=>setForm({...form,preferences:{...form.preferences,travelStyle:s}})}
                        style={{ padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:`1px solid ${form.preferences.travelStyle===s?'var(--accent)':'var(--border)'}`, background: form.preferences.travelStyle===s?'var(--accent-glow)':'transparent', color: form.preferences.travelStyle===s?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.8rem', textTransform:'capitalize', transition:'all 0.2s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Interests (pick any)</label>
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                    {INTERESTS.map(i => {
                      const active = form.preferences.interests.includes(i);
                      return (
                        <button key={i} type="button" onClick={()=>toggleInterest(i)}
                          style={{ padding:'0.35rem 0.75rem', borderRadius:999, border:`1px solid ${active?'var(--accent)':'var(--border)'}`, background: active?'var(--accent-glow)':'transparent', color: active?'var(--accent)':'var(--text-3)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s', textTransform:'capitalize' }}>
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={()=>setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:2, justifyContent:'center', padding:'0.85rem' }} disabled={loading}>
                    {loading ? <><Loader size={16} className="animate-spin"/> Creating...</> : 'Create Account'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <p style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--text-2)', fontSize:'0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
