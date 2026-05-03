import React from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} color="var(--green)" />,
  error: <AlertCircle size={18} color="var(--red)" />,
  info: <Info size={18} color="var(--accent)" />,
  warning: <AlertTriangle size={18} color="var(--amber)" />
};

const colors = {
  success: 'var(--green)',
  error: 'var(--red)',
  info: 'var(--accent)',
  warning: 'var(--amber)'
};

export const Toast = ({ notification, onDismiss }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    background: 'var(--surface)', border: `1px solid ${colors[notification.type] || 'var(--border)'}`,
    borderRadius: 'var(--radius)', padding: '0.875rem 1rem',
    boxShadow: 'var(--shadow-lg)', minWidth: 280, maxWidth: 360,
    animation: 'fadeIn 0.3s ease'
  }}>
    {icons[notification.type] || icons.info}
    <div style={{ flex: 1 }}>
      {notification.title && <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem', marginBottom: '0.2rem' }}>{notification.title}</div>}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{notification.message}</div>
    </div>
    <button onClick={() => onDismiss(notification.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'2px' }}>
      <X size={14} />
    </button>
  </div>
);

export const ToastContainer = ({ notifications, onDismiss }) => (
  <div style={{ position:'fixed', top:'1.5rem', right:'1.5rem', zIndex:9999, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
    {notifications.map(n => <Toast key={n.id} notification={n} onDismiss={onDismiss} />)}
  </div>
);
