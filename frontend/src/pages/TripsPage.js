import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Compass } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import TripCard from '../components/trip/TripCard';
import CreateTripModal from '../components/trip/CreateTripModal';
import Spinner from '../components/ui/Spinner';

const STATUSES = ['all','planning','upcoming','ongoing','completed','cancelled'];

const TripsPage = () => {
  const { trips, loading, fetchTrips, deleteTrip, pagination } = useTrip();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips({ status: statusFilter === 'all' ? undefined : statusFilter });
  }, [fetchTrips, statusFilter]);

  const filtered = trips.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.destination?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Delete this trip? This cannot be undone.')) {
      await deleteTrip(id);
    }
  };

  return (
    <div style={{ padding:'2rem', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', animation:'fadeIn 0.4s ease' }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em' }}>My Trips</h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginTop:'0.2rem' }}>{pagination.total} trips total</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}>
          <Plus size={16} /> New Trip
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap', animation:'fadeIn 0.5s ease' }}>
        <div style={{ position:'relative', flex:'1', minWidth:200 }}>
          <Search size={16} color="var(--text-3)" style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          <input className="input" placeholder="Search trips..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.5rem' }} />
        </div>
        <div style={{ display:'flex', gap:'0.35rem', alignItems:'center', flexWrap:'wrap' }}>
          <Filter size={14} color="var(--text-3)" />
          {STATUSES.map(s => (
            <button key={s} onClick={()=>setStatusFilter(s)}
              style={{ padding:'0.4rem 0.75rem', borderRadius:999, border:`1px solid ${statusFilter===s?'var(--accent)':'var(--border)'}`, background: statusFilter===s?'var(--accent-glow)':'transparent', color: statusFilter===s?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.78rem', textTransform:'capitalize', transition:'all 0.2s' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', animation:'fadeIn 0.4s ease' }}>
          <Compass size={56} color="var(--text-3)" style={{ margin:'0 auto 1rem' }} />
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.25rem', marginBottom:'0.5rem' }}>{search ? 'No trips found' : 'No trips yet'}</h3>
          <p style={{ color:'var(--text-2)', marginBottom:'1.5rem' }}>{search ? 'Try a different search' : 'Create your first adventure'}</p>
          {!search && <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={16} /> Plan a Trip</button>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'1rem' }}>
          {filtered.map((trip,i) => (
            <div key={trip._id} style={{ animation:`fadeIn ${0.3+i*0.06}s ease` }}>
              <TripCard trip={trip} onDelete={handleDelete} onEdit={(t)=>navigate(`/trips/${t._id}`)} />
            </div>
          ))}
        </div>
      )}

      <CreateTripModal isOpen={showCreate} onClose={()=>setShowCreate(false)} onSuccess={(trip)=>navigate(`/trips/${trip._id}`)} />
    </div>
  );
};
export default TripsPage;
