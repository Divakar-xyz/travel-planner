import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { formatDate, formatCurrency, getDaysUntil, getBudgetColor } from '../../utils/helpers';

const STATUS_COLORS = { planning:'var(--text-3)', upcoming:'var(--accent)', ongoing:'var(--green)', completed:'var(--amber)', cancelled:'var(--red)' };
const STATUS_BG = { planning:'rgba(100,116,139,0.15)', upcoming:'rgba(56,189,248,0.15)', ongoing:'rgba(16,185,129,0.15)', completed:'rgba(245,158,11,0.15)', cancelled:'rgba(239,68,68,0.15)' };

const TripCard = ({ trip, onDelete, onEdit }) => {
  const daysUntil = getDaysUntil(trip.dates?.start);
  const budgetPct = trip.budget?.total > 0 ? Math.round((trip.budget.spent / trip.budget.total) * 100) : 0;
  const duration = trip.duration || Math.ceil((new Date(trip.dates?.end) - new Date(trip.dates?.start)) / 86400000);

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1rem', transition:'all 0.25s', cursor:'pointer' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(56,189,248,0.1)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
            <span style={{ background:STATUS_BG[trip.status], color:STATUS_COLORS[trip.status], padding:'0.2rem 0.6rem', borderRadius:999, fontSize:'0.72rem', fontFamily:'Syne,sans-serif', fontWeight:700, textTransform:'capitalize' }}>
              {trip.status}
            </span>
            {daysUntil > 0 && daysUntil < 30 && <span className="badge badge-blue">In {daysUntil} days</span>}
          </div>
          <Link to={`/trips/${trip._id}`} style={{ textDecoration:'none' }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)', letterSpacing:'-0.01em' }}>
              {trip.title}
            </h3>
          </Link>
        </div>
        <div style={{ display:'flex', gap:'0.35rem', flexShrink:0 }}>
          <button onClick={e=>{ e.stopPropagation(); onEdit?.(trip); }} style={{ width:32, height:32, background:'transparent', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; }}>
            <Edit size={14} />
          </button>
          <button onClick={e=>{ e.stopPropagation(); onDelete?.(trip._id); }} style={{ width:32, height:32, background:'transparent', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(239,68,68,0.05)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; e.currentTarget.style.background='transparent'; }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', color:'var(--text-2)', fontSize:'0.82rem' }}>
          <MapPin size={13} color="var(--accent)" /> {trip.destination?.name}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', color:'var(--text-2)', fontSize:'0.82rem' }}>
          <Calendar size={13} color="var(--green)" /> {formatDate(trip.dates?.start)} · {duration}d
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', color:'var(--text-2)', fontSize:'0.82rem' }}>
          <DollarSign size={13} color="var(--amber)" /> {formatCurrency(trip.budget?.total)}
        </div>
      </div>

      {/* Budget bar */}
      {trip.budget?.total > 0 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem', fontSize:'0.75rem', color:'var(--text-3)' }}>
            <span>Budget used</span>
            <span style={{ color: getBudgetColor(budgetPct) }}>{budgetPct}%</span>
          </div>
          <div style={{ height:4, background:'var(--bg-3)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${Math.min(budgetPct,100)}%`, background:getBudgetColor(budgetPct), borderRadius:2, transition:'width 0.8s ease' }} />
          </div>
        </div>
      )}

      <Link to={`/trips/${trip._id}`} className="btn btn-ghost" style={{ justifyContent:'center', fontSize:'0.82rem', padding:'0.5rem' }}>
        View Details →
      </Link>
    </div>
  );
};
export default TripCard;
