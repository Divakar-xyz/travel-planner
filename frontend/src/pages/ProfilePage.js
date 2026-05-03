import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Lock, Save, Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import { getInitials } from '../utils/helpers';

const STYLES = ['adventure','cultural','relaxation','foodie','nature','urban'];
const BUDGETS = ['budget','mid-range','luxury'];
const INTERESTS = ['museums','restaurants','parks','shopping','nightlife','beaches','history','art','sports','photography'];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [profile, setProfile] = useState({ name: user?.name||'', preferences: { budgetRange: user?.preferences?.budgetRange||'mid-range', travelStyle: user?.preferences?.travelStyle||'cultural', interests: user?.preferences?.interests||[] } });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirm:'' });

  const toggleInterest = (i) => {
    const curr = profile.preferences.interests;
    setProfile(p => ({ ...p, preferences: { ...p.preferences, interests: curr.includes(i) ? curr.filter(x=>x!==i) : [...curr,i] } }));
  };

  const saveProfile = async () => {
    setSaving(true); setMsg(''); setErr('');
    try {
      await updateUser(profile);
      setMsg('Profile updated successfully');
    } catch (e) { setErr(e.response?.data?.error||'Failed to update'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) { setErr('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { setErr('New password must be at least 6 characters'); return; }
    setSaving(true); setMsg(''); setErr('');
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setMsg('Password changed successfully');
      setPasswords({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (e) { setErr(e.response?.data?.error||'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding:'2rem', maxWidth:700, margin:'0 auto' }}>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em' }}>Profile Settings</h1>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>Manage your account and preferences</p>
      </div>

      {/* Avatar */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ width:64,height:64,borderRadius:'50%',background:'var(--accent-glow)',border:'2px solid rgba(56,189,248,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.5rem',color:'var(--accent)' }}>
          {getInitials(user?.name)}
        </div>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1.1rem' }}>{user?.name}</div>
          <div style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>{user?.email}</div>
          <div style={{ marginTop:'0.35rem' }}>
            <span className="badge badge-blue" style={{ fontSize:'0.7rem', textTransform:'capitalize' }}>{user?.preferences?.budgetRange}</span>
            {' '}
            <span className="badge badge-purple" style={{ fontSize:'0.7rem', textTransform:'capitalize' }}>{user?.preferences?.travelStyle}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', background:'var(--bg-2)', borderRadius:'var(--radius)', padding:'0.25rem' }}>
        {[{id:'profile',icon:User,label:'Profile'},{id:'security',icon:Lock,label:'Security'}].map(({id,icon:Icon,label})=>(
          <button key={id} onClick={()=>{setTab(id);setMsg('');setErr('');}} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:'0.6rem', background:tab===id?'var(--surface)':'transparent', border:'none', borderRadius:8, cursor:'pointer', color:tab===id?'var(--text)':'var(--text-3)', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.82rem', transition:'all 0.2s' }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {msg && <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'0.75rem', marginBottom:'1rem', color:'var(--green)', fontSize:'0.875rem' }}>{msg}</div>}
      {err && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius)', padding:'0.75rem', marginBottom:'1rem', color:'var(--red)', fontSize:'0.875rem' }}>{err}</div>}

      {tab === 'profile' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <label className="input-label">Full Name</label>
            <input className="input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/>
          </div>
          <div>
            <label className="input-label">Budget Style</label>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
              {BUDGETS.map(b=>(
                <button key={b} type="button" onClick={()=>setProfile(p=>({...p,preferences:{...p.preferences,budgetRange:b}}))} style={{ padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:`1px solid ${profile.preferences.budgetRange===b?'var(--accent)':'var(--border)'}`, background:profile.preferences.budgetRange===b?'var(--accent-glow)':'transparent', color:profile.preferences.budgetRange===b?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.8rem', textTransform:'capitalize', transition:'all 0.2s' }}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Travel Style</label>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
              {STYLES.map(s=>(
                <button key={s} type="button" onClick={()=>setProfile(p=>({...p,preferences:{...p.preferences,travelStyle:s}}))} style={{ padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:`1px solid ${profile.preferences.travelStyle===s?'var(--accent)':'var(--border)'}`, background:profile.preferences.travelStyle===s?'var(--accent-glow)':'transparent', color:profile.preferences.travelStyle===s?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.8rem', textTransform:'capitalize', transition:'all 0.2s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Interests</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.5rem' }}>
              {INTERESTS.map(i=>{
                const active = profile.preferences.interests.includes(i);
                return <button key={i} type="button" onClick={()=>toggleInterest(i)} style={{ padding:'0.3rem 0.7rem', borderRadius:999, border:`1px solid ${active?'var(--accent)':'var(--border)'}`, background:active?'var(--accent-glow)':'transparent', color:active?'var(--accent)':'var(--text-3)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, textTransform:'capitalize', transition:'all 0.2s' }}>{i}</button>;
              })}
            </div>
          </div>
          <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={saveProfile} disabled={saving}>
            {saving ? <><Spinner size={14}/> Saving...</> : <><Save size={14}/> Save Changes</>}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label className="input-label">Current Password</label>
            <input className="input" type="password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))} placeholder="••••••••"/>
          </div>
          <div>
            <label className="input-label">New Password</label>
            <input className="input" type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))} placeholder="Min. 6 characters"/>
          </div>
          <div>
            <label className="input-label">Confirm New Password</label>
            <input className="input" type="password" value={passwords.confirm} onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))} placeholder="••••••••"/>
          </div>
          <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={changePassword} disabled={saving || !passwords.currentPassword || !passwords.newPassword}>
            {saving ? <><Spinner size={14}/> Changing...</> : <><Lock size={14}/> Change Password</>}
          </button>
        </div>
      )}
    </div>
  );
};

const Spinner = ({ size = 14 }) => (
  <div style={{ width:size, height:size, border:`2px solid rgba(255,255,255,0.2)`, borderTop:`2px solid currentColor`, borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }}/>
);

export default ProfilePage;
