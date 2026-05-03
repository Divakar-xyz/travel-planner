import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, MapPin, Calendar, DollarSign } from 'lucide-react';
import { locationAPI } from '../../services/api';
import { useTrip } from '../../context/TripContext';
import Modal from '../ui/Modal';

const CreateTripModal = ({ isOpen, onClose, onSuccess }) => {
  const { createTrip } = useTrip();
  const [form, setForm] = useState({ title:'', description:'', destination:null, dates:{ start:'', end:'' }, budget:{ total:'', currency:'INR' }, tags:'' });
  const [destSearch, setDestSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (destSearch.length < 3) { setSearchResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await locationAPI.geocode(destSearch);
        setSearchResults(data.results || []);
      } catch {} finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [destSearch]);

  const selectDest = (result) => {
    setForm(f => ({ ...f, destination: { name: result.name, country: result.country, coordinates: result.coordinates, placeId: result.placeId } }));
    setDestSearch(result.name);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination) { setError('Please select a destination'); return; }
    if (!form.dates.start || !form.dates.end) { setError('Please set travel dates'); return; }
    if (new Date(form.dates.start) >= new Date(form.dates.end)) { setError('End date must be after start date'); return; }
    setLoading(true); setError('');
    try {
      const tripData = { ...form, budget: { ...form.budget, total: parseFloat(form.budget.total) || 0 }, tags: form.tags ? form.tags.split(',').map(t=>t.trim()) : [] };
      const trip = await createTrip(tripData);
      onSuccess?.(trip);
      onClose();
      setForm({ title:'', description:'', destination:null, dates:{ start:'', end:'' }, budget:{ total:'', currency:'USD' }, tags:'' });
      setDestSearch('');
    } catch (err) { setError(err.response?.data?.error || 'Failed to create trip'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan New Trip" maxWidth={580}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius)', padding:'0.75rem', color:'var(--red)', fontSize:'0.875rem' }}>{error}</div>}

        <div>
          <label className="input-label">Trip Title</label>
          <input className="input" placeholder="Summer in Europe" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        </div>

        <div style={{ position:'relative' }}>
          <label className="input-label"><MapPin size={12} style={{ display:'inline', marginRight:4 }} />Destination</label>
          <div style={{ position:'relative' }}>
            <input className="input" placeholder="Search city or country..." value={destSearch}
              onChange={e=>{ setDestSearch(e.target.value); if(!e.target.value) setForm(f=>({...f,destination:null})); }}
              style={{ paddingRight:'2.5rem' }} />
            <div style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)' }}>
              {searching ? <Loader size={16} className="animate-spin" color="var(--text-3)" /> : <Search size={16} color="var(--text-3)" />}
            </div>
          </div>
          {searchResults.length > 0 && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden', zIndex:100, boxShadow:'var(--shadow)' }}>
              {searchResults.slice(0,5).map((r,i) => (
                <button key={i} type="button" onClick={()=>selectDest(r)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1rem', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.15s', color:'var(--text)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <MapPin size={14} color="var(--accent)" style={{ flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{r.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{r.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {form.destination && <div style={{ marginTop:'0.35rem', fontSize:'0.78rem', color:'var(--green)', display:'flex', alignItems:'center', gap:'0.35rem' }}><span>✓</span> {form.destination.name} selected</div>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <div>
            <label className="input-label"><Calendar size={12} style={{ display:'inline', marginRight:4 }} />Start Date</label>
            <input className="input" type="date" value={form.dates.start} onChange={e=>setForm({...form,dates:{...form.dates,start:e.target.value}})} required />
          </div>
          <div>
            <label className="input-label">End Date</label>
            <input className="input" type="date" value={form.dates.end} min={form.dates.start} onChange={e=>setForm({...form,dates:{...form.dates,end:e.target.value}})} required />
          </div>
        </div>

        <div>
          <label className="input-label"><DollarSign size={12} style={{ display:'inline', marginRight:4 }} />Total Budget (₹ INR)</label>
          <input className="input" type="number" placeholder="2000" min="0" value={form.budget.total} onChange={e=>setForm({...form,budget:{...form.budget,total:e.target.value}})} />
        </div>

        <div>
          <label className="input-label">Description (optional)</label>
          <textarea className="input" placeholder="What's this trip about?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{ resize:'vertical' }} />
        </div>

        <div>
          <label className="input-label">Tags (comma separated)</label>
          <input className="input" placeholder="beach, family, adventure" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
        </div>

        <div style={{ display:'flex', gap:'0.75rem', paddingTop:'0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:2, justifyContent:'center' }}>
            {loading ? <><Loader size={14} className="animate-spin" /> Creating...</> : '🚀 Create Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default CreateTripModal;
