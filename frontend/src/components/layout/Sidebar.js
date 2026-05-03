import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Map, LayoutDashboard, Plus, BarChart2, User, LogOut, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { to:'/dashboard', icon: LayoutDashboard, label:'Dashboard' },
  { to:'/trips', icon: Compass, label:'My Trips' },
  { to:'/trips/new', icon: Plus, label:'New Trip' },
  { to:'/analytics', icon: BarChart2, label:'Analytics' },
  { to:'/profile', icon: User, label:'Profile' }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: collapsed ? 72 : 240, minHeight:'100vh', background:'var(--bg-2)',
      borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column',
      transition:'width 0.3s ease', position:'relative', flexShrink:0
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1.5rem 0' : '1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', borderBottom:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ width:40, height:40, background:'var(--accent-glow)', border:'1px solid rgba(56,189,248,0.3)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Map size={20} color="var(--accent)" />
        </div>
        {!collapsed && <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.25rem', letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>Wandr</span>}
      </div>

      {/* Toggle button */}
      <button onClick={()=>setCollapsed(!collapsed)} style={{
        position:'absolute', top:'4.5rem', right:'-12px', width:24, height:24,
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-2)', zIndex:10
      }}>
        {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
      </button>

      {/* Nav */}
      <nav style={{ flex:1, padding:'1rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.25rem', overflow:'hidden' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} title={collapsed ? label : ''} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:'0.75rem', padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            borderRadius:'var(--radius)', textDecoration:'none', transition:'all 0.2s', whiteSpace:'nowrap', overflow:'hidden',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: isActive ? 'var(--accent-glow)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-2)',
            border: isActive ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
            fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem'
          })}>
            <Icon size={18} style={{ flexShrink:0 }} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding:'0.75rem', borderTop:'1px solid var(--border)', overflow:'hidden' }}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--surface)', borderRadius:'var(--radius)', marginBottom:'0.5rem' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-glow)', border:'1px solid rgba(56,189,248,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.8rem', color:'var(--accent)', flexShrink:0 }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ color:'var(--text-3)', fontSize:'0.75rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width:'100%', display:'flex', alignItems:'center', gap:'0.75rem', padding: collapsed ? '0.75rem' : '0.65rem 1rem',
          background:'transparent', border:'1px solid transparent', borderRadius:'var(--radius)',
          cursor:'pointer', color:'var(--text-3)', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem',
          justifyContent: collapsed ? 'center' : 'flex-start', transition:'all 0.2s'
        }} onMouseEnter={e=>{e.currentTarget.style.color='var(--red)';e.currentTarget.style.borderColor='rgba(239,68,68,0.3)';e.currentTarget.style.background='rgba(239,68,68,0.05)';}}
           onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.background='transparent';}}>
          <LogOut size={18} style={{ flexShrink:0 }} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
