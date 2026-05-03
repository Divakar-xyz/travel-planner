import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Zap, Trash2, RefreshCw, Cloud, ChevronDown, ChevronUp, Clock, AlertTriangle, Star, Edit3, UserPlus, BarChart2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { collabAPI, weatherAPI } from '../services/api';
import TripMap from '../components/map/TripMap';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { formatDate, formatCurrency, getCategoryIcon, getWeatherIcon, getBudgetColor, getDaysUntil } from '../utils/helpers';

const WeatherBadge = ({ weather }) => {
  if (!weather) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.15)', borderRadius:999, padding:'0.25rem 0.6rem', fontSize:'0.75rem', color:'var(--text-2)' }}>
      {getWeatherIcon(weather.condition)} {Math.round(weather.temp?.avg || 0)}°C · {weather.description}
    </div>
  );
};

const GenerateModal = ({ isOpen, onClose, onGenerate }) => {
  const [opts, setOpts] = useState({ categories:['tourism','restaurant','park'], pacePreference:'moderate', useHiddenGems:false });
  const [loading, setLoading] = useState(false);
  const catOptions = ['tourism','restaurant','park','museum','shopping','nightlife'];
  const toggleCat = (c) => setOpts(o => ({ ...o, categories: o.categories.includes(c) ? o.categories.filter(x=>x!==c) : [...o.categories,c] }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧠 Generate Smart Itinerary">
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        <div style={{ background:'rgba(56,189,248,0.05)', border:'1px solid rgba(56,189,248,0.15)', borderRadius:'var(--radius)', padding:'0.875rem', fontSize:'0.83rem', color:'var(--text-2)', lineHeight:1.6 }}>
          Our algorithm fetches real map data, groups nearby places, and builds an optimized daily schedule using nearest-neighbor routing.
        </div>
        <div>
          <label className="input-label">Place Categories</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.5rem' }}>
            {catOptions.map(c => (
              <button key={c} type="button" onClick={()=>toggleCat(c)}
                style={{ padding:'0.35rem 0.8rem', borderRadius:999, border:`1px solid ${opts.categories.includes(c)?'var(--accent)':'var(--border)'}`, background: opts.categories.includes(c)?'var(--accent-glow)':'transparent', color: opts.categories.includes(c)?'var(--accent)':'var(--text-2)', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Syne,sans-serif', fontWeight:600, textTransform:'capitalize', transition:'all 0.2s' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="input-label">Travel Pace</label>
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
            {['slow','moderate','fast'].map(p => (
              <button key={p} type="button" onClick={()=>setOpts(o=>({...o,pacePreference:p}))}
                style={{ flex:1, padding:'0.5rem', borderRadius:'var(--radius)', border:`1px solid ${opts.pacePreference===p?'var(--accent)':'var(--border)'}`, background: opts.pacePreference===p?'var(--accent-glow)':'transparent', color: opts.pacePreference===p?'var(--accent)':'var(--text-2)', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Syne,sans-serif', fontWeight:600, textTransform:'capitalize', transition:'all 0.2s' }}>
                {p === 'slow' ? '🐢 Slow (3/day)' : p === 'moderate' ? '🚶 Moderate (5/day)' : '⚡ Fast (7/day)'}
              </button>
            ))}
          </div>
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer', padding:'0.75rem', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          <input type="checkbox" checked={opts.useHiddenGems} onChange={e=>setOpts(o=>({...o,useHiddenGems:e.target.checked}))} style={{ width:16,height:16,accentColor:'var(--accent)' }} />
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem' }}>✨ Hidden Gems Mode</div>
            <div style={{ color:'var(--text-3)', fontSize:'0.78rem', marginTop:'0.1rem' }}>Filter out tourist traps, surface lesser-known gems with high ratings</div>
          </div>
        </label>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2, justifyContent:'center' }} disabled={loading || opts.categories.length === 0}
            onClick={async()=>{ setLoading(true); try { await onGenerate(opts); onClose(); } finally { setLoading(false); } }}>
            {loading ? <><Spinner size={14}/> Generating...</> : '⚡ Generate Itinerary'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const InviteModal = ({ isOpen, onClose, tripId }) => {
  const [input, setInput] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleInvite = async () => {
    if (!input) return;
    setLoading(true); setMsg(''); setErr('');
    try {
      await collabAPI.invite(tripId, { emailOrUsername: input, role });
      setMsg(`Invitation sent to ${input}`);
      setInput('');
    } catch (e) { setErr(e.response?.data?.error || 'Failed to invite'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Collaborator">
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {msg && <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'0.75rem', color:'var(--green)', fontSize:'0.875rem' }}>{msg}</div>}
        {err && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius)', padding:'0.75rem', color:'var(--red)', fontSize:'0.875rem' }}>{err}</div>}
        <div>
          <label className="input-label">Email or Username</label>
          <input className="input" placeholder="friend@example.com" value={input} onChange={e=>setInput(e.target.value)} />
        </div>
        <div>
          <label className="input-label">Permission</label>
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
            {['viewer','editor'].map(r => (
              <button key={r} type="button" onClick={()=>setRole(r)}
                style={{ flex:1, padding:'0.5rem', borderRadius:'var(--radius)', border:`1px solid ${role===r?'var(--accent)':'var(--border)'}`, background: role===r?'var(--accent-glow)':'transparent', color: role===r?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.82rem', textTransform:'capitalize', transition:'all 0.2s' }}>
                {r === 'viewer' ? '👁️ Viewer' : '✏️ Editor'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Close</button>
          <button className="btn btn-primary" onClick={handleInvite} disabled={loading || !input} style={{ flex:2, justifyContent:'center' }}>
            {loading ? <><Spinner size={14}/> Sending...</> : <><UserPlus size={14}/> Send Invite</>}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DayCard = ({ day, tripId, onReplan, onRemovePlace, selectedDay, onSelect }) => {
  const isOpen = selectedDay === day.dayNumber;
  const totalCost = day.places.reduce((s,p) => s + (p.estimatedCost||0), 0);

  return (
    <div className="card" style={{ padding:0, overflow:'hidden', border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)', transition:'border-color 0.2s' }}>
      <button onClick={()=>onSelect(isOpen ? null : day.dayNumber)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ width:40, height:40, borderRadius:10, background: isOpen ? 'var(--accent-glow)':'var(--bg-3)', border:`1px solid ${isOpen?'rgba(56,189,248,0.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'0.9rem', color: isOpen?'var(--accent)':'var(--text-2)', flexShrink:0 }}>
          {day.dayNumber}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--text)' }}>Day {day.dayNumber} · {formatDate(day.date)}</div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.2rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--text-3)', display:'flex', alignItems:'center', gap:'0.25rem' }}><MapPin size={11}/> {day.places.length} places</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-3)', display:'flex', alignItems:'center', gap:'0.25rem' }}><Clock size={11}/> {day.estimatedTravelTime}min travel</span>
            <span style={{ fontSize:'0.75rem', color:'var(--amber)', display:'flex', alignItems:'center', gap:'0.25rem' }}><DollarSign size={11}/> ~${totalCost}</span>
            {day.estimatedDistance > 0 && <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{day.estimatedDistance}km</span>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
          <button onClick={e=>{e.stopPropagation();onReplan(day.dayNumber);}} title="Replan day" style={{ width:30,height:30,background:'transparent',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',color:'var(--text-3)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--accent)';e.currentTarget.style.borderColor='var(--accent)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border)';}}>
            <RefreshCw size={12}/>
          </button>
          {isOpen ? <ChevronUp size={16} color="var(--text-3)"/> : <ChevronDown size={16} color="var(--text-3)"/>}
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop:'1px solid var(--border)', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          {day.places.length === 0 ? (
            <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text-3)', fontSize:'0.875rem' }}>No places yet. Add some or replan this day.</div>
          ) : day.places.map((place, idx) => (
            <div key={place._id || idx} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0.875rem', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-2)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ width:28, height:28, borderRadius:8, background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>{getCategoryIcon(place.category)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{place.name}</span>
                  {place.isHiddenGem && <span style={{ fontSize:'0.65rem', background:'rgba(168,85,247,0.15)', color:'var(--purple)', padding:'0.1rem 0.4rem', borderRadius:999, fontFamily:'Syne,sans-serif', fontWeight:700 }}>✨ Gem</span>}
                </div>
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.15rem', flexWrap:'wrap' }}>
                  {place.startTime && <span style={{ fontSize:'0.72rem', color:'var(--accent)' }}>{place.startTime}–{place.endTime}</span>}
                  <span style={{ fontSize:'0.72rem', color:'var(--text-3)', textTransform:'capitalize' }}>{place.category}</span>
                  {place.estimatedCost > 0 && <span style={{ fontSize:'0.72rem', color:'var(--amber)' }}>${place.estimatedCost}</span>}
                  {place.visitDuration && <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{place.visitDuration}min</span>}
                </div>
              </div>
              <button onClick={()=>onRemovePlace(day.dayNumber, place._id)} style={{ width:26,height:26,background:'transparent',border:'none',cursor:'pointer',color:'var(--text-3)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,transition:'all 0.2s',flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--red)';e.currentTarget.style.background='rgba(239,68,68,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.background='transparent';}}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTrip, currentTrip, fetchItinerary, generateItinerary, itinerary, removePlace, replanDay, deleteTrip } = useTrip();
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [weather, setWeather] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTrip(id);
        await fetchItinerary(id);
        if (data?.trip?.destination?.coordinates) {
          const { lat, lng } = data.trip.destination.coordinates;
          weatherAPI.get(lat, lng, 7).then(({ data: wd }) => setWeather(wd)).catch(()=>{});
        }
      } finally { setLoading(false); }
    };
    load();
  }, [id, fetchTrip, fetchItinerary]);

  const handleGenerate = async (opts) => {
    setGenLoading(true);
    try { await generateItinerary(id, opts); setSelectedDay(1); setActiveTab('itinerary'); }
    finally { setGenLoading(false); }
  };

  const handleReplan = async (dayNum) => {
    await replanDay(id, dayNum, null);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this trip permanently?')) {
      await deleteTrip(id);
      navigate('/trips');
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <Spinner size={40} />
    </div>
  );

  if (!currentTrip) return (
    <div style={{ padding:'3rem', textAlign:'center' }}>
      <h2 style={{ fontFamily:'Syne,sans-serif', marginBottom:'1rem' }}>Trip not found</h2>
      <button className="btn btn-primary" onClick={()=>navigate('/trips')}>Back to trips</button>
    </div>
  );

  const { trip, budgetEstimate, collaborators, userRole } = currentTrip;
  const isEditor = userRole === 'owner' || userRole === 'editor';
  const days = itinerary?.days || [];
  const allPlaces = selectedDay ? (days.find(d=>d.dayNumber===selectedDay)?.places || []) : days.flatMap(d=>d.places);
  const selectedDayData = days.find(d=>d.dayNumber===selectedDay);
  const daysUntil = getDaysUntil(trip.dates?.start);
  const budgetPct = budgetEstimate?.percentageUsed || 0;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Left panel */}
      <div style={{ width:420, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)', overflow:'hidden' }}>
        {/* Trip header */}
        <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border)', background:'var(--bg-2)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.01em', marginBottom:'0.3rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trip.title}</h1>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color:'var(--text-2)' }}><MapPin size={12} color="var(--accent)"/> {trip.destination?.name}</span>
                <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color:'var(--text-2)' }}><Calendar size={12} color="var(--green)"/> {formatDate(trip.dates?.start)} – {formatDate(trip.dates?.end)}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.35rem', flexShrink:0, marginLeft:'0.5rem' }}>
              {isEditor && (
                <>
                  <button className="btn btn-ghost" style={{ padding:'0.4rem 0.7rem', fontSize:'0.78rem' }} onClick={()=>setShowGenerate(true)}>
                    <Zap size={13}/> Generate
                  </button>
                  <button className="btn btn-ghost" style={{ padding:'0.4rem 0.7rem', fontSize:'0.78rem' }} onClick={()=>setShowInvite(true)}>
                    <UserPlus size={13}/>
                  </button>
                </>
              )}
              <button className="btn btn-danger" style={{ padding:'0.4rem 0.7rem', fontSize:'0.78rem' }} onClick={handleDelete}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>

          {/* Budget bar */}
          {budgetEstimate && (
            <div style={{ background:'var(--bg-3)', borderRadius:'var(--radius)', padding:'0.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem', fontSize:'0.78rem' }}>
                <span style={{ color:'var(--text-2)', display:'flex', alignItems:'center', gap:'0.3rem' }}><DollarSign size={11}/> Budget</span>
                <span style={{ color: getBudgetColor(budgetPct), fontFamily:'Syne,sans-serif', fontWeight:700 }}>{formatCurrency(budgetEstimate.estimatedTotal)} / {formatCurrency(budgetEstimate.userBudget)}</span>
              </div>
              <div style={{ height:5, background:'var(--surface)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${Math.min(budgetPct,100)}%`, background:getBudgetColor(budgetPct), borderRadius:3, transition:'width 0.8s ease' }}/>
              </div>
              {budgetEstimate.isOverBudget && (
                <div style={{ marginTop:'0.4rem', fontSize:'0.72rem', color:'var(--red)', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <AlertTriangle size={11}/> Over budget by {formatCurrency(Math.abs(budgetEstimate.budgetDifference))}
                </div>
              )}
            </div>
          )}

          {/* Alerts */}
          {daysUntil > 0 && daysUntil <= 7 && (
            <div style={{ marginTop:'0.75rem', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'var(--radius)', padding:'0.5rem 0.75rem', fontSize:'0.78rem', color:'var(--amber)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <AlertTriangle size={12}/> Trip starts in {daysUntil} day{daysUntil!==1?'s':''}!
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg-2)' }}>
          {['itinerary','weather','team'].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{ flex:1, padding:'0.75rem', background:'transparent', border:'none', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.8rem', textTransform:'capitalize', color: activeTab===tab?'var(--accent)':'var(--text-3)', borderBottom: activeTab===tab?'2px solid var(--accent)':'2px solid transparent', transition:'all 0.2s' }}>
              {tab === 'itinerary' ? <><MapPin size={12} style={{ display:'inline', marginRight:4 }}/>{tab}</> : tab === 'weather' ? <><Cloud size={12} style={{ display:'inline', marginRight:4 }}/>{tab}</> : <><Users size={12} style={{ display:'inline', marginRight:4 }}/>{tab}</>}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
          {activeTab === 'itinerary' && (
            <>
              {genLoading ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'3rem', gap:'1rem' }}>
                  <Spinner size={36}/><p style={{ color:'var(--text-2)', fontSize:'0.875rem', textAlign:'center' }}>Fetching map data & building your itinerary...</p>
                </div>
              ) : days.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2.5rem 1rem' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🗺️</div>
                  <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'0.5rem', fontSize:'1rem' }}>No itinerary yet</h3>
                  <p style={{ color:'var(--text-2)', fontSize:'0.8rem', marginBottom:'1.25rem', lineHeight:1.6 }}>Generate a smart itinerary using real OpenStreetMap data</p>
                  {isEditor && <button className="btn btn-primary" style={{ fontSize:'0.82rem' }} onClick={()=>setShowGenerate(true)}><Zap size={14}/> Generate Itinerary</button>}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {days.map(day => (
                    <DayCard key={day.dayNumber} day={day} tripId={id}
                      onReplan={handleReplan}
                      onRemovePlace={(dayNum, placeId) => removePlace(id, dayNum, placeId)}
                      selectedDay={selectedDay} onSelect={setSelectedDay} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'weather' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {weather?.forecast ? weather.forecast.slice(0,7).map((w,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'1.5rem', flexShrink:0 }}>{getWeatherIcon(w.condition)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.85rem' }}>{new Date(w.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-2)', textTransform:'capitalize' }}>{w.description}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1rem' }}>{Math.round(w.temp?.avg||0)}°</div>
                    <div style={{ fontSize:'0.72rem', color: w.isOutdoorFriendly?'var(--green)':'var(--red)' }}>{w.isOutdoorFriendly?'✓ Good':'✗ Indoor'}</div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>
                  <Cloud size={32} style={{ margin:'0 auto 0.75rem' }}/><br/>No weather data available.<br/><span style={{ fontSize:'0.8rem' }}>Add an OpenWeatherMap API key for live forecasts.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
                <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--accent-glow)',border:'1px solid rgba(56,189,248,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontFamily:'Syne,sans-serif',fontWeight:700,color:'var(--accent)' }}>
                  {trip.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem' }}>{trip.owner?.name || 'Owner'}</div>
                  <span className="badge badge-blue" style={{ fontSize:'0.65rem' }}>Owner</span>
                </div>
              </div>
              {collaborators?.filter(c=>c.status==='accepted').map(c => (
                <div key={c._id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--bg-3)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontFamily:'Syne,sans-serif',fontWeight:700,color:'var(--text-2)' }}>
                    {c.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem' }}>{c.user?.name}</div>
                    <span className={`badge ${c.role==='editor'?'badge-green':'badge-blue'}`} style={{ fontSize:'0.65rem', textTransform:'capitalize' }}>{c.role}</span>
                  </div>
                </div>
              ))}
              {isEditor && (
                <button className="btn btn-ghost" style={{ justifyContent:'center', fontSize:'0.82rem' }} onClick={()=>setShowInvite(true)}>
                  <UserPlus size={14}/> Invite Collaborator
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:'relative' }}>
        {days.length > 0 && (
          <div style={{ position:'absolute', top:'1rem', left:'1rem', zIndex:500, display:'flex', gap:'0.4rem', flexWrap:'wrap', maxWidth:'calc(100% - 2rem)' }}>
            <button onClick={()=>setSelectedDay(null)} style={{ padding:'0.35rem 0.75rem', borderRadius:999, border:`1px solid ${!selectedDay?'var(--accent)':'var(--border)'}`, background:!selectedDay?'rgba(0,0,0,0.7)':'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', color:!selectedDay?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.75rem', transition:'all 0.2s' }}>All Days</button>
            {days.map(d => (
              <button key={d.dayNumber} onClick={()=>setSelectedDay(d.dayNumber)} style={{ padding:'0.35rem 0.6rem', borderRadius:999, border:`1px solid ${selectedDay===d.dayNumber?'var(--accent)':'var(--border)'}`, background:selectedDay===d.dayNumber?'rgba(0,0,0,0.7)':'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', color:selectedDay===d.dayNumber?'var(--accent)':'var(--text-2)', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.75rem', transition:'all 0.2s' }}>Day {d.dayNumber}</button>
            ))}
          </div>
        )}
        <TripMap
          center={trip.destination?.coordinates}
          zoom={13}
          places={allPlaces}
          route={selectedDayData?.route || []}
          showRoute={!!selectedDay && (selectedDayData?.route?.length > 1)}
          height="100%"
        />
      </div>

      <GenerateModal isOpen={showGenerate} onClose={()=>setShowGenerate(false)} onGenerate={handleGenerate} />
      <InviteModal isOpen={showInvite} onClose={()=>setShowInvite(false)} tripId={id} />
    </div>
  );
};
export default TripDetailPage;
