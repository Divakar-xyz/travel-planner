import React from 'react';
export const Spinner = ({ size = 24, color = 'var(--accent)' }) => (
  <div style={{
    width: size, height: size, border: `2px solid rgba(255,255,255,0.1)`,
    borderTop: `2px solid ${color}`, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }} />
);
export default Spinner;
