import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 560 }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
        width:'100%', maxWidth, maxHeight:'90vh', overflow:'auto',
        boxShadow:'var(--shadow-lg)', animation:'fadeIn 0.25s ease'
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-2)', padding:'4px', borderRadius:'6px' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding:'1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};
export default Modal;
